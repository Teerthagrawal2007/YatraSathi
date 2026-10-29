import { z } from "zod";

export const createTripSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  destination: z.string().min(2, "Destination required"),
  state: z.string().optional(),
  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  endDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  totalBudget: z.number().positive("Budget must be greater than 0"),
  currency: z.literal("INR").default("INR"),
  coverImage: z.string().url().or(z.string()).optional(),
  itineraryJson: z.string().optional(),
});

export const updateTripSchema = createTripSchema.partial().extend({
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED"]).optional(),
});

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
