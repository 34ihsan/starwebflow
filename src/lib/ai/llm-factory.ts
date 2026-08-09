import { ILLMProvider } from './interfaces';
import { GroqProvider } from './providers/groq';
import { OpenRouterProvider } from './providers/openrouter';

export class LLMFactory {
  private static providers: Map<string, ILLMProvider> = new Map();

  static {
    // Auto-register default providers
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
   * Falls back to a default provider if the requested one isn't found.
   */
  static getProvider(name: string): ILLMProvider {
    const provider = this.providers.get(name);
    
    if (!provider) {
      console.warn(`Provider '${name}' not found. Falling back to default provider.`);
      const defaultProvider = this.providers.get('groq') || Array.from(this.providers.values())[0];
      
      if (!defaultProvider) {
         throw new Error('No LLM providers registered in the factory.');
      }
      return defaultProvider;
    }
    
    if (!provider.isConfigured()) {
       throw new Error(`Provider '${name}' is not configured (missing API keys).`);
    }

    return provider;
  }
}

