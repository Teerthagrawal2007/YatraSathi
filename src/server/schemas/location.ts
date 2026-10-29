import { z } from "zod";

export const locationPingSchema = z.object({
  tripId: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().positive().optional(),
  locality: z.string().optional(),
});

export const locationConsentSchema = z.object({
  optIn: z.boolean(),
});

export type LocationPingInput = z.infer<typeof locationPingSchema>;
