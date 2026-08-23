import { env, pipeline } from "@huggingface/transformers";

// Transformers.js v3 uses purely optional sharp/jimp for images.
// For NLP, it uses WASM bindings out of the box in Node.js
env.allowLocalModels = false; // Force download from HF hub to cache

async function runTest() {
  console.log("=== Phase 3.1-B Local Embedding Standalone Test ===");
  const textToEmbed = "India's strategic autonomy depends on balancing relations with major powers.";
  
  try {
    const startMem = process.memoryUsage().rss / 1024 / 1024;
    console.log(`Initial Memory (RSS): ${startMem.toFixed(2)} MB`);

    const t0 = performance.now();
    console.log("Initializing model Xenova/all-MiniLM-L6-v2...");
    
    // Create the pipeline (this downloads the model on the first run)
    const embedder = await pipeline("feature-extraction" as any, "Xenova/all-MiniLM-L6-v2", {
      dtype: "q8"
    });
    
    const t1 = performance.now();
    const coldStart = t1 - t0;
    
    const postInitMem = process.memoryUsage().rss / 1024 / 1024;
    console.log(`\nCold Start Initialization: ${coldStart.toFixed(2)} ms`);
    console.log(`Memory after Init: ${postInitMem.toFixed(2)} MB (+${(postInitMem - startMem).toFixed(2)} MB)`);

    console.log("\nGenerating embedding (Warm start)...");
    const t2 = performance.now();
    const output = await embedder(textToEmbed, {
      pooling: "mean",
      normalize: true,
    });
    const t3 = performance.now();
    const warmStart = t3 - t2;

    // Convert Tensor to normal JS Array
    const vector = Array.from(output.data);
    
    console.log(`Warm Embedding Time: ${warmStart.toFixed(2)} ms`);
    console.log(`Vector Dimensions: ${vector.length}`);
    console.log(`First 5 elements of vector: ${vector.slice(0, 5).map(n => typeof n === 'number' ? n.toFixed(4) : n).join(", ")}`);

    if (vector.length !== 384) {
      console.error(`\n❌ FAILED: Expected 384 dimensions, got ${vector.length}`);
      process.exit(1);
    }

    if (vector.some(v => typeof v !== 'number' || isNaN(v))) {
      console.error(`\n❌ FAILED: Vector contains invalid values.`);
      process.exit(1);
    }

    console.log(`\n✅ TEST PASSED: Successfully generated 384-dimensional local embeddings without sharp crashes.`);
    process.exit(0);

  } catch (error: any) {
    console.error(`\n❌ TEST FAILED: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

runTest();
