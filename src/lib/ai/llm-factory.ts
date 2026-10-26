import { ILLMProvider } from './interfaces';
import { GroqProvider } from './providers/groq';
import { OpenRouterProvider } from './providers/openrouter';
import { OllamaProvider } from './providers/ollama';

export class LLMFactory {
  private static providers: Map<string, ILLMProvider> = new Map();

  static {
    // Auto-register default providers
    this.registerProvider(new OllamaProvider());
    this.registerProvider(new GroqProvider());
    this.registerProvider(new OpenRouterProvider());
  }

  /**
   * Register a new LLM provider.
   */
  static registerProvider(provider: ILLMProvider) {
    this.providers.set(provider.name, provider);
  }

  /**
   * Retrieves the requested provider.
   * Falls back to local Ollama or another configured provider if the requested one isn't found/configured.
   */
  static getProvider(name: string = process.env.AI_PROVIDER || 'ollama'): ILLMProvider {
    const provider = this.providers.get(name);
    
    if (provider && provider.isConfigured()) {
      return provider;
    }

    const ollamaFallback = this.providers.get('ollama');
    if (ollamaFallback && ollamaFallback.isConfigured()) {
      console.warn(`Provider '${name}' not available/configured. Falling back to local Ollama provider.`);
      return ollamaFallback;
    }

    const anyConfigured = Array.from(this.providers.values()).find((p) => p.isConfigured());
    if (anyConfigured) {
      return anyConfigured;
    }

    throw new Error(`No configured LLM providers available (requested: '${name}').`);
  }
}

