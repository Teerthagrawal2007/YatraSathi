import { z } from "zod";

export const sosTriggerSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  batteryLevel: z.number().min(0).max(100).optional(),
  customNote: z.string().max(200).optional(),
});

export const safetyContactSchema = z.object({
  name: z.string().min(2, "Name required"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Must be a valid 10-digit Indian phone number"),
  relationship: z.string().default("Emergency Contact"),
  isPrimary: z.boolean().default(false),
});

export type SosTriggerInput = z.infer<typeof sosTriggerSchema>;
export type SafetyContactInput = z.infer<typeof safetyContactSchema>;
