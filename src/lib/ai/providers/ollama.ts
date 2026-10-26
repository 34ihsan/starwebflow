import { ILLMProvider, IGenerationOptions, IImageGenerationOptions, IVideoGenerationOptions } from '../interfaces';

export interface IOllamaToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface IOllamaHealthStatus {
  online: boolean;
  baseUrl: string;
  models: string[];
  activeModels: string[];
  error?: string;
}

/**
 * Cleans model output by stripping <think>...</think> blocks and stray tool_call wrappers.
 */
export function cleanModelOutput(rawText: string): string {
  if (!rawText) return '';
  return rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<think>[\s\S]*$/gi, '')
    .trim();
}

/**
 * Flattens nested wrapper objects (e.g. lead_data, data, lead, user) that smaller 1.5B/3B models
 * sometimes place inside tool call arguments.
 */
export function normalizeToolArguments(rawArgs: any): Record<string, any> {
  if (!rawArgs) return {};
  const parsed = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
  if (typeof parsed !== 'object' || Array.isArray(parsed)) return {};

  const wrapperKeys = ['lead_data', 'leadData', 'lead', 'data', 'user', 'contact', 'params'];
  const result: Record<string, any> = { ...parsed };
  for (const key of wrapperKeys) {
    if (result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])) {
      Object.assign(result, result[key]);
      delete result[key];
    }
  }
  return result;
}

/**
 * Hybrid parser that catches both <tool_call>{...}</tool_call> tags and inline JSON
 * tool calls (e.g. {"name": "save_lead", "arguments": {...}}) emitted by 1.5B/3B models.
 */
export function parseHybridToolCalls(rawText: string, allowedToolNames?: string[]): {
  toolCalls: IOllamaToolCall[];
  cleanedText: string;
} {
  const toolCalls: IOllamaToolCall[] = [];
  let text = cleanModelOutput(rawText);

  const isAllowed = (name: string) =>
    !allowedToolNames || allowedToolNames.length === 0 || allowedToolNames.includes(name);

  // 1. Parse explicit <tool_call>...</tool_call> blocks
  const tagRegex = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/gi;
  text = text.replace(tagRegex, (fullMatch, innerJson) => {
    try {
      const parsed = JSON.parse(innerJson.trim());
      const fnName = parsed?.name || parsed?.function?.name;
      const fnArgs = parsed?.arguments || parsed?.parameters || parsed?.function?.arguments || {};
      if (typeof fnName === 'string' && isAllowed(fnName)) {
        toolCalls.push({
          name: fnName,
          arguments: normalizeToolArguments(fnArgs),
        });
        return '';
      }
    } catch {
      // Ignore malformed tag content
    }
    return fullMatch;
  });

  // 2. Parse markdown ```json ... ``` or inline JSON tool-call objects (supports nested braces)
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)```/gi;
  text = text.replace(fenceRegex, (fullMatch, inner) => {
    try {
      const parsed = JSON.parse(inner.trim());
      const fnName = parsed?.name || parsed?.function?.name;
      const fnArgs = parsed?.arguments || parsed?.parameters || parsed?.function?.arguments;
      if (typeof fnName === 'string' && fnArgs && isAllowed(fnName)) {
        toolCalls.push({
          name: fnName,
          arguments: normalizeToolArguments(fnArgs),
        });
        return '';
      }
    } catch {
      // Not a valid tool call block
    }
    return fullMatch;
  });

  // 3. Fallback for bare JSON tool call without code fences
  if (toolCalls.length === 0) {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      const candidate = text.slice(firstBrace, lastBrace + 1);
      try {
        const parsed = JSON.parse(candidate);
        const fnName = parsed?.name || parsed?.function?.name;
        const fnArgs = parsed?.arguments || parsed?.parameters || parsed?.function?.arguments;
        if (typeof fnName === 'string' && fnArgs && isAllowed(fnName)) {
          toolCalls.push({
            name: fnName,
            arguments: normalizeToolArguments(fnArgs),
          });
          text = (text.slice(0, firstBrace) + text.slice(lastBrace + 1)).trim();
        }
      } catch {
        // Ignore if not a single JSON object
      }
    }
  }

  return {
    toolCalls,
    cleanedText: text.trim(),
  };
}

export class OllamaProvider implements ILLMProvider {
  readonly name = 'ollama';

  private baseUrl: string;
  private defaultModel: string;
  private coderModel: string;
  private embedModel: string;

  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
    this.defaultModel = process.env.OLLAMA_FLASH_MODEL || 'qwen2.5-coder:3b';
    this.coderModel = process.env.OLLAMA_CODER_MODEL || 'qwen2.5-coder:3b';
    this.embedModel = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text:latest';
  }

  isConfigured(): boolean {
    return process.env.OLLAMA_ENABLED !== 'false';
  }

  /**
   * Automatically selects the best local model from E:\OllamaModels based on prompt type.
   */
  resolveModel(prompt: string, requestedModel?: string): string {
    if (requestedModel && requestedModel.trim().length > 0) {
      return requestedModel;
    }
    const isCodeTask =
      /\b(python|typescript|javascript|sql|prisma|react|nextjs|html|css|function|class|kod|algoritma)\b/i.test(prompt) &&
      /```|\bdef\b|\bconst\b|\bfunction\b/i.test(prompt);

    if (isCodeTask) {
      return this.coderModel;
    }
    return this.defaultModel;
  }

  async checkHealth(): Promise<IOllamaHealthStatus> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const [tagsRes, psRes] = await Promise.all([
        fetch(`${this.baseUrl}/api/tags`, { signal: controller.signal }),
        fetch(`${this.baseUrl}/api/ps`, { signal: controller.signal }),
      ]);
      clearTimeout(timeout);

      if (!tagsRes.ok) {
        return {
          online: false,
          baseUrl: this.baseUrl,
          models: [],
          activeModels: [],
          error: `HTTP ${tagsRes.status}`,
        };
      }

      const tagsData = await tagsRes.json();
      const psData = psRes.ok ? await psRes.json() : { models: [] };

      return {
        online: true,
        baseUrl: this.baseUrl,
        models: (tagsData.models || []).map((m: any) => m.name),
        activeModels: (psData.models || []).map((m: any) => m.name),
      };
    } catch (err: any) {
      return {
        online: false,
        baseUrl: this.baseUrl,
        models: [],
        activeModels: [],
        error: err.message,
      };
    }
  }

  async generateText(prompt: string, options?: IGenerationOptions & { system?: string }): Promise<string> {
    const model = this.resolveModel(prompt, options?.model);
    const messages: Array<{ role: string; content: string }> = [];

    if (options?.system) {
      messages.push({ role: 'system', content: options.system });
    }
    messages.push({ role: 'user', content: prompt });

    const controller = new AbortController();
    // Allow up to 90s for cold load from E:\OllamaModels external USB 3.0 drive
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    try {
      const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.3,
          frequency_penalty: 0.4,
          presence_penalty: 0.3,
          max_tokens: options?.maxTokens ?? 1024,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errText}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '';
      return cleanModelOutput(rawContent);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Generates 768-dimensional semantic embeddings using nomic-embed-text:latest in E:\OllamaModels.
   */
  async generateEmbedding(input: string | string[]): Promise<number[][]> {
    const response = await fetch(`${this.baseUrl}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.embedModel,
        input,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama embedding error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.embeddings || [];
  }

  async generateImage(_options: IImageGenerationOptions): Promise<string> {
    throw new Error('Yerel Ollama metin ve vektör modelidir; görsel üretimi için Imagen / Fal.ai sağlayıcısını kullanın.');
  }

  async generateVideo(_options: IVideoGenerationOptions): Promise<string> {
    throw new Error('Yerel Ollama metin ve vektör modelidir; video üretimi için Veo sağlayıcısını kullanın.');
  }
}
