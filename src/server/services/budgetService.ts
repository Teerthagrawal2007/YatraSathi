import { ExpenseCategory, ExpenseSplitMember } from "../schemas/expense";

/**
 * Format currency into Indian Rupees (INR)
 * e.g., ₹1,25,000 as specified by conventions
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹0";
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface SplitResult {
  memberName: string;
  amountOwed: number;
  percentage: number;
}

/**
 * Calculate expense split between members
 * Supports EQUAL, EXACT, and PERCENTAGE
 */
export function calculateExpenseSplit(
  totalAmount: number,
  splitType: "EQUAL" | "EXACT" | "PERCENTAGE",
  members: { name: string; shareRatio?: number; exactAmount?: number }[]
): SplitResult[] {
  if (!members || members.length === 0) {
    return [{ memberName: "You", amountOwed: totalAmount, percentage: 100 }];
  }

  if (totalAmount <= 0) {
    return members.map((m) => ({ memberName: m.name, amountOwed: 0, percentage: 0 }));
  }

  if (splitType === "EQUAL") {
    const count = members.length;
    const baseShare = Math.floor((totalAmount / count) * 100) / 100;
    let remainder = Math.round((totalAmount - baseShare * count) * 100) / 100;

    return members.map((m, index) => {
      // Allocate leftover cents to first member
      const share = index === 0 ? baseShare + remainder : baseShare;
      return {
        memberName: m.name,
        amountOwed: Math.round(share * 100) / 100,
        percentage: Math.round((share / totalAmount) * 1000) / 10,
      };
    });
  }

  if (splitType === "PERCENTAGE") {
    const totalRatio = members.reduce((sum, m) => sum + (m.shareRatio || 0), 0);
    const normalizedRatioSum = totalRatio === 0 ? 100 : totalRatio;

    return members.map((m) => {
      const pct = (m.shareRatio || 0) / normalizedRatioSum;
      const owed = Math.round(totalAmount * pct * 100) / 100;
      return {
        memberName: m.name,
        amountOwed: owed,
        percentage: Math.round(pct * 1000) / 10,
      };
    });
  }

  if (splitType === "EXACT") {
    return members.map((m) => {
      const owed = m.exactAmount || 0;
      return {
        memberName: m.name,
        amountOwed: owed,
        percentage: Math.round((owed / totalAmount) * 1000) / 10,
      };
    });
  }

  return members.map((m) => ({ memberName: m.name, amountOwed: 0, percentage: 0 }));
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentSpent: number;
  isOverBudget: boolean;
  categoryBreakdown: Record<ExpenseCategory, number>;
  dailyAverageSpend: number;
  formattedTotalBudget: string;
  formattedTotalSpent: string;
  formattedRemainingBudget: string;
}

/**
 * Aggregate expenses and compute budget health metrics
 */
export function calculateBudgetSummary(
  totalBudget: number,
  expenses: { amount: number; category: string; expenseDate: Date | string }[],
  tripDurationDays = 1
): BudgetSummary {
  const initialBreakdown: Record<ExpenseCategory, number> = {
    FOOD: 0,
    STAY: 0,
    TRAVEL: 0,
    SHOPPING: 0,
    ACTIVITIES: 0,
    OTHER: 0,
  };

  let totalSpent = 0;
  const categoryBreakdown = { ...initialBreakdown };

  for (const exp of expenses) {
    const amt = Number(exp.amount) || 0;
    totalSpent += amt;
    const cat = (exp.category as ExpenseCategory) || "OTHER";
    if (categoryBreakdown[cat] !== undefined) {
      categoryBreakdown[cat] += amt;
    } else {
      categoryBreakdown.OTHER += amt;
    }
  }

  const remainingBudget = totalBudget - totalSpent;
  const percentSpent = totalBudget > 0 ? Math.min(100, Math.round((totalSpent / totalBudget) * 100)) : 100;
  const isOverBudget = totalSpent > totalBudget;
  const safeDays = Math.max(1, tripDurationDays);
  const dailyAverageSpend = Math.round((totalSpent / safeDays) * 100) / 100;

  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    percentSpent,
    isOverBudget,
    categoryBreakdown,
    dailyAverageSpend,
    formattedTotalBudget: formatINR(totalBudget),
    formattedTotalSpent: formatINR(totalSpent),
    formattedRemainingBudget: formatINR(remainingBudget),
  };
}
