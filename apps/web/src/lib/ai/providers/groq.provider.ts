import Groq from "groq-sdk";
import { IAIProvider, StructuredGenerateOptions } from "../provider.interface";

export class RateLimitError extends Error {
  constructor(message: string, public retryAfterMs?: number) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class GroqProvider implements IAIProvider {
  private client: Groq | null = null;

  private getClient(): Groq {
    if (!this.client) {
      this.client = new Groq({
        apiKey: process.env.GROQ_API_KEY || "missing_key",
      });
    }
    return this.client;
  }

  async generateStructured<T>(options: StructuredGenerateOptions): Promise<{
    data: T;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    const { 
      model, 
      systemPrompt, 
      userPrompt, 
      schema, 
      schemaName, 
      temperature = 0, 
      maxTokens = 4000 
    } = options;

    let chatCompletion;
    try {
      chatCompletion = await this.getClient().chat.completions.create({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        model: model,
        temperature: temperature,
        max_tokens: maxTokens,
        response_format: { 
          type: "json_schema", 
          json_schema: {
            name: schemaName,
            strict: true,
            schema: schema
          }
        }
      });
    } catch (e: any) {
      if (e.status === 429) {
        // Groq rate limit. Try to extract retry headers if they exist in the SDK error
        let retryAfterMs = undefined;
        
        // groq-sdk typically exposes headers on the error object
        if (e.headers) {
          const retryAfterStr = e.headers['retry-after'] || e.headers['retry-after-ms'];
          if (retryAfterStr) {
            const parsed = parseFloat(retryAfterStr);
            if (!isNaN(parsed)) {
              // retry-after is usually in seconds, sometimes ms
              retryAfterMs = parsed < 1000 ? parsed * 1000 : parsed;
            }
          }
        }
        
        throw new RateLimitError("Groq Rate Limit Exceeded", retryAfterMs);
      }
      throw e;
    }

    const responseText = chatCompletion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error("No response received from Groq");
    }

    try {
      const parsedData = JSON.parse(responseText) as T;
      return {
        data: parsedData,
        usage: chatCompletion.usage ? {
          promptTokens: chatCompletion.usage.prompt_tokens,
          completionTokens: chatCompletion.usage.completion_tokens,
          totalTokens: chatCompletion.usage.total_tokens
        } : undefined
      };
    } catch (e) {
      console.error("[GroqProvider] Failed to parse JSON response:", responseText);
      throw new Error("Failed to parse structured output from provider");
    }
  }

  getProviderName(): string {
    return "groq";
  }
}

// Export a singleton instance
export const groqProvider = new GroqProvider();
