import { z } from "zod";

export const watchlistSchema = z.object({
  entityType: z.enum(["country", "leader", "conflict", "alliance", "topic"], {
    required_error: "Entity type is required",
    invalid_type_error: "Invalid entity type",
  }),
  entityId: z.string().min(1, "Entity ID is required"),
});
