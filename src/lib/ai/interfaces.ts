export interface IGenerationOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface IImageGenerationOptions {
  model?: string;
  prompt: string;
  size?: string; // e.g., '1024x1024'
}

export interface IVideoGenerationOptions {
  model?: string;
  prompt: string;
  duration?: number;
}

export interface ILLMProvider {
  /**
   * Identifies the provider for logging/routing purposes.
   */
  readonly name: string;
  
  /**
   * Check if the required API keys are configured.
   */
  isConfigured(): boolean;

  /**
   * Generates a text response based on the prompt.
   */
  generateText(prompt: string, options?: IGenerationOptions): Promise<string>;

  /**
   * Generates an image URL based on the prompt.
   */
  generateImage(options: IImageGenerationOptions): Promise<string>;

  /**
   * Generates a video URL or ID based on the prompt.
   */
  generateVideo(options: IVideoGenerationOptions): Promise<string>;
}
