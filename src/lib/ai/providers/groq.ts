import { ILLMProvider, IGenerationOptions, IImageGenerationOptions, IVideoGenerationOptions } from '../interfaces';

export class GroqProvider implements ILLMProvider {
  readonly name = 'groq';
  
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async generateText(prompt: string, options?: IGenerationOptions): Promise<string> {
    if (!this.isConfigured()) throw new Error('Groq is not configured.');
    
    // Implementation for Groq text generation API
    // Normally you'd use Groq SDK or fetch API here
    return `[Groq Generated Text] Responses for: ${prompt.substring(0, 50)}...`;
  }

  async generateImage(options: IImageGenerationOptions): Promise<string> {
    throw new Error('Groq does not support image generation natively. Route to another provider.');
  }

  async generateVideo(options: IVideoGenerationOptions): Promise<string> {
    throw new Error('Groq does not support video generation.');
  }
}
