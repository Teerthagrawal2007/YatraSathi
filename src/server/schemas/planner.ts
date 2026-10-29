import { z } from "zod";

export const plannerInputSchema = z.object({
  destination: z.string().min(2, "Destination must be at least 2 characters"),
  state: z.string().optional(),
  days: z.number().int().min(1, "Trip must be at least 1 day").max(30, "Maximum 30 days"),
  budget: z.number().positive("Budget must be a positive number"),
  travelers: z.number().int().min(1).max(20).default(1),
  travelStyle: z.enum(["budget", "balanced", "luxury", "backpacking", "family"]).default("balanced"),
  interests: z.array(z.string()).default([]),
  startDate: z.string().optional(),
});

export type PlannerInput = z.infer<typeof plannerInputSchema>;

export const activitySchema = z.object({
  time: z.string(), // "Morning" | "Afternoon" | "Evening"
  title: z.string(),
  description: z.string(),
  location: z.string(),
  estimatedCostINR: z.number().nonnegative(),
  tips: z.string().optional(),
});

export const dayPlanSchema = z.object({
  day: z.number().int().positive(),
  theme: z.string(),
  activities: z.array(activitySchema),
  dailyEstimatedCostINR: z.number().nonnegative(),
});

export const plannerOutputSchema = z.object({
  destination: z.string(),
  overview: z.string(),
  durationDays: z.number().int().positive(),
  totalEstimatedCostINR: z.number().nonnegative(),
  currency: z.literal("INR"),
  bestTimeToVisit: z.string(),
  localCuisine: z.array(z.string()),
  days: z.array(dayPlanSchema),
  packingTips: z.array(z.string()),
  safetyTips: z.array(z.string()),
  emergencyInfo: z.object({
    localPolice: z.string(),
    nearestHospital: z.string(),
    nationalHelpline: z.string().default("112"),
    touristHelpline: z.string().default("1363"),
  }),
});

export type PlannerOutput = z.infer<typeof plannerOutputSchema>;
export type DayPlan = z.infer<typeof dayPlanSchema>;
export type Activity = z.infer<typeof activitySchema>;
