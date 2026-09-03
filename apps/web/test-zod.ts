import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { askChanakyaResponseSchema } from "./src/lib/intelligence/validators";

const s1 = zodToJsonSchema(askChanakyaResponseSchema as any);
console.log("SCHEMA:", JSON.stringify(s1, null, 2));
console.log("askChanakyaResponseSchema:", askChanakyaResponseSchema);
