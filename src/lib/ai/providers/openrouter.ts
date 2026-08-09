import { ILLMProvider, IGenerationOptions, IImageGenerationOptions, IVideoGenerationOptions } from '../interfaces';

export class OpenRouterProvider implements ILLMProvider {
  readonly name = 'openrouter';
  
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateText(prompt: string, options?: IGenerationOptions): Promise<string> {
    if (!this.isConfigured()) throw new Error('OpenRouter is not configured.');
    
    const model = options?.model || 'meta-llama/llama-3-8b-instruct:free'; // Example default
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          'X-Title': 'StarWebFlow',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1000,
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';

    } catch (error) {
      console.error('OpenRouter text generation failed:', error);
      throw error;
    }
  }

  async generateImage(options: IImageGenerationOptions): Promise<string> {
    if (!this.isConfigured()) throw new Error('OpenRouter is not configured.');
    // Currently OpenRouter supports image gen via specific models, e.g., stabilityai/stable-diffusion-v3-medium
    // This is a simplified stub
    return `[OpenRouter Image URL for: ${options.prompt}]`;
  }

  async generateVideo(options: IVideoGenerationOptions): Promise<string> {
    // Similarly for video if supported by an OpenRouter model
    return `[OpenRouter Video URL for: ${options.prompt}]`;
  }
}
