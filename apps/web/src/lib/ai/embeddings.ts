import { pipeline, env } from "@huggingface/transformers";

// Optional: Optimize for serverless by disabling local caching if not on Vercel
// On Vercel, node_modules is cached but /tmp is temporary. By default Transformers.js downloads to ./models or node_modules
// We will let it use its default caching which works on most environments including Vercel
env.allowLocalModels = false; 

/**
 * Singleton factory for the embedding pipeline to prevent reloading the model on every call
 * within the same serverless function instance.
 */
class PipelineSingleton {
  static task: string = "feature-extraction";
  static model: string = "Xenova/all-MiniLM-L6-v2";
  static instance: any = null;

  static async getInstance() {
    if (this.instance === null) {
      console.log(`[Embeddings] Initializing ${this.model} pipeline (cold start)...`);
      this.instance = await pipeline(this.task as any, this.model, {
        dtype: "q8" // Use dtype instead of quantized for V3
      });
      console.log(`[Embeddings] ${this.model} pipeline initialized successfully.`);
    }
    return this.instance;
  }
}

/**
 * Generates vector embeddings using a local Transformers.js model
 * @param text The text to embed
 * @returns A 384-dimensional number array
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  try {
    const embedder = await PipelineSingleton.getInstance();
    
    // Generate embeddings
    const output = await embedder(text, {
      pooling: "mean",
      normalize: true,
    });
    
    // Convert Tensor output back to standard JS array
    return Array.from(output.data);
  } catch (error) {
    console.error("Embedding generation failed", error);
    throw new Error("Failed to generate local embeddings.");
  }
}

