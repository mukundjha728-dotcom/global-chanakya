import { z } from "zod";

export const bookmarkSchema = z.object({
  blogId: z.string().min(1, "Blog ID is required"),
});
