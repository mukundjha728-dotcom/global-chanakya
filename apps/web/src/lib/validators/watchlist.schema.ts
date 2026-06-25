import { z } from "zod";

export const watchlistSchema = z.object({
  entityType: z.enum(["country", "leader", "conflict", "alliance", "topic"]),
  entityId: z.string().min(1, "Entity ID is required"),
});
