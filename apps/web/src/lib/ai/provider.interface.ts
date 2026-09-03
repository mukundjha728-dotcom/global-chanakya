export interface StructuredGenerateOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  schema: Record<string, unknown>; // JSON Schema object for strict outputs
  schemaName: string; // The name identifier for the schema
  schemaDescription?: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface RawGenerateOptions {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface IAIProvider {
  /**
   * Generates a structured JSON object strictly adhering to the provided JSON schema.
   */
  generateStructured<T>(options: StructuredGenerateOptions): Promise<{
    data: T;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }
  }>;

  /**
   * Generates raw text without JSON schema enforcement.
   */
  generateRaw(options: RawGenerateOptions): Promise<{
    text: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }
  }>;
  
  /**
   * Returns the name of the underlying provider (e.g. "groq")
   */
  getProviderName(): string;
}
