import { askChanakyaResponseSchema } from "./src/lib/intelligence/validators";
import { zodToJsonSchema } from "zod-to-json-schema";

const schema = zodToJsonSchema(askChanakyaResponseSchema, "MySchema");
console.log(JSON.stringify(schema, null, 2));
