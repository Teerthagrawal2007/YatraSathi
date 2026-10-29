import { z } from "zod";

export const expenseCategorySchema = z.enum([
  "FOOD",
  "STAY",
  "TRAVEL",
  "SHOPPING",
  "ACTIVITIES",
  "OTHER",
]);

export const expenseSplitMemberSchema = z.object({
  name: z.string(),
  amount: z.number().nonnegative(),
  shareRatio: z.number().optional(), // For percentage or ratio based split
});

export const createExpenseSchema = z.object({
  tripId: z.string().min(1, "Trip ID required"),
  title: z.string().min(2, "Expense title must be at least 2 characters"),
  amount: z.number().positive("Amount must be greater than 0"),
  category: expenseCategorySchema.default("FOOD"),
  paidBy: z.string().default("You"),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE"]).default("EQUAL"),
  splitMembers: z.array(expenseSplitMemberSchema).optional(),
  expenseDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type ExpenseSplitMember = z.infer<typeof expenseSplitMemberSchema>;
