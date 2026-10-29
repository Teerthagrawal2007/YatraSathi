import { z } from "zod";

export const bookingCategorySchema = z.enum(["TRAVEL", "STAY", "EXPERIENCE"]);

export const passengerSchema = z.object({
  name: z.string().default("You"),
  age: z.number().optional(),
  gender: z.string().optional(),
  seatPreference: z.string().optional(),
  phone: z.string().optional(),
});

export const createBookingSchema = z.object({
  tripId: z.string().optional(),
  category: bookingCategorySchema,
  title: z.string().min(2, "Title is required"),
  provider: z.string().min(1, "Provider is required"),
  price: z.number().positive("Price must be positive"),
  isEstimated: z.boolean().default(true),
  bookingDate: z
    .string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}/))
    .default(() => new Date().toISOString()),
  details: z.record(z.string(), z.any()).optional(),
  passenger: passengerSchema.optional(),
  attachExpense: z.boolean().default(true),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type BookingCategory = z.infer<typeof bookingCategorySchema>;
export type PassengerInfo = z.infer<typeof passengerSchema>;
