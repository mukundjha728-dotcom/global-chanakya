import Groq from "groq-sdk";
import { IAIProvider, StructuredGenerateOptions } from "../provider.interface";
import { GroqKeyManager } from "../groqKeyManager";

export class RateLimitError extends Error {
  constructor(message: string, public retryAfterMs?: number) {
    super(message);
    this.name = "RateLimitError";
  }
}

export class GroqProvider implements IAIProvider {
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
      maxTokens = 4000,
      signal
    } = options;

    let attempts = 0;
    const maxAttempts = 5; // try up to 5 times (representing 5 keys max)
    
    while (attempts < maxAttempts) {
      attempts++;
      const keyConfig = await GroqKeyManager.getAvailableKey();
      if (!keyConfig) {
        throw new Error("No healthy Groq API keys available.");
      }

      const client = new Groq({ apiKey: keyConfig.value });

      let chatCompletion;
      try {
        chatCompletion = await client.chat.completions.create({
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
        }, { signal });
        
        // Success
        await GroqKeyManager.markSuccess(keyConfig.id);

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

      } catch (e: any) {
        if (e.status === 429) {
          let retryAfterMs = undefined;
          if (e.headers) {
            const retryAfterStr = e.headers['retry-after'] || e.headers['retry-after-ms'];
            if (retryAfterStr) {
              const parsed = parseFloat(retryAfterStr);
              if (!isNaN(parsed)) {
                retryAfterMs = parsed < 1000 ? parsed * 1000 : parsed;
              }
            }
          }
          await GroqKeyManager.markRateLimited(keyConfig.id, retryAfterMs);
          continue;
        } else if (e.status >= 500 || e.code === 'ECONNRESET' || e.code === 'ETIMEDOUT') {
          // Provider error or network timeout
          await GroqKeyManager.markFailure(keyConfig.id);
          continue;
        }
        
        // Other errors (e.g. 400 Bad Request) shouldn't trigger key failover
        throw e;
      }
    }
    
    throw new Error("All Groq key rotation attempts failed.");
  }

  getProviderName(): string {
    return "groq";
  }
}

// Export a singleton instance
export const groqProvider = new GroqProvider();
