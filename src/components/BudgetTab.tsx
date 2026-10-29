"use client";

import React, { useState } from "react";
import { useI18n, formatIndianDate, formatINR } from "@/i18n";
import {
  Wallet,
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Users,
  Utensils,
  Building2,
  Train,
  ShoppingBag,
  Ticket,
  MoreHorizontal,
  Trash2,
  Loader2,
  Calendar,
} from "lucide-react";

interface BudgetTabProps {
  trips: any[];
  activeTripId: string | null;
  onSelectActiveTrip: (id: string) => void;
  onRefreshTrips: () => void;
}

export function BudgetTab({
  trips,
  activeTripId,
  onSelectActiveTrip,
  onRefreshTrips,
}: BudgetTabProps) {
  const { t } = useI18n();

  const activeTrip = trips.find((tr) => tr.id === activeTripId) || trips[0];

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState<"FOOD" | "STAY" | "TRAVEL" | "SHOPPING" | "ACTIVITIES" | "OTHER">("FOOD");
  const [paidBy, setPaidBy] = useState("You");
  const [companionsStr, setCompanionsStr] = useState("You, Rohan");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  if (!activeTrip) {
    return (
      <div className="py-20 text-center max-w-md mx-auto">
        <Wallet className="w-12 h-12 text-stone-400 mx-auto mb-3" />
        <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">
          No trip available for budgeting
        </h3>
        <p className="text-xs text-stone-500 mt-1">
          Generate an itinerary or create a trip first to track expenses in INR.
        </p>
      </div>
    );
  }

  const { budgetSummary } = activeTrip;
  const companions = companionsStr
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const splitAmount = amount && companions.length > 0 ? Math.round(Number(amount) / companions.length) : 0;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    setIsSubmitting(true);
    try {
      const splitDetails = companions.map((comp) => ({
        name: comp,
        amount: splitAmount,
      }));

      const res = await fetch(`/api/trips/${activeTrip.id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          category,
          paidBy: paidBy.trim() || "You",
          splitType: "EQUAL",
          splitDetails,
          expenseDate: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setTitle("");
        setAmount("");
        setShowAddModal(false);
        onRefreshTrips();
      }
    } catch (err) {
      console.error("Failed to add expense", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm("Delete this expense item?")) return;
    setIsDeletingId(expenseId);
    try {
      const res = await fetch(`/api/trips/${activeTrip.id}/expenses`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expenseId }),
      });
      if (res.ok) {
        onRefreshTrips();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeletingId(null);
    }
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    FOOD: <Utensils className="w-4 h-4 text-orange-500" />,
    STAY: <Building2 className="w-4 h-4 text-teal-500" />,
    TRAVEL: <Train className="w-4 h-4 text-blue-500" />,
    SHOPPING: <ShoppingBag className="w-4 h-4 text-purple-500" />,
    ACTIVITIES: <Ticket className="w-4 h-4 text-amber-500" />,
    OTHER: <MoreHorizontal className="w-4 h-4 text-stone-500" />,
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 text-xs font-semibold mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>₹ INR Smart Budget Manager</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            {t.budget.title}
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            {t.budget.subtitle} for <span className="font-semibold text-stone-800 dark:text-stone-200">{activeTrip.title}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t.budget.addExpense}</span>
        </button>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Budget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {t.budget.totalBudget}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            {formatINR(activeTrip.totalBudget)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            Target envelope for {activeTrip.durationDays} days
          </span>
        </div>

        {/* Total Spent */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {t.budget.totalSpent}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-1">
            {formatINR(budgetSummary.totalSpent)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {budgetSummary.percentSpent}% of total budget
          </span>
        </div>

        {/* Remaining */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            {t.budget.remaining}
          </span>
          <div
            className={`text-2xl sm:text-3xl font-extrabold mt-1 ${
              budgetSummary.isOverBudget
                ? "text-red-600 dark:text-red-400"
                : "text-teal-600 dark:text-teal-400"
            }`}
          >
            {formatINR(budgetSummary.remainingBudget)}
          </div>
          <span className="text-[11px] text-stone-400 mt-1 block">
            {budgetSummary.isOverBudget ? (
              <span className="text-red-500 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {t.budget.overBudget}
              </span>
            ) : (
              "Under budget safe zone"
            )}
          </span>
        </div>
      </div>

      {/* Category Breakdown Bars */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-orange-600" />
          Spending by Category
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(budgetSummary.categoryBreakdown).map(([catKey, catAmount]: [string, any]) => {
            const pct = budgetSummary.totalSpent > 0 ? Math.round((catAmount / budgetSummary.totalSpent) * 100) : 0;
            const catLabel = (t.budget.categories as any)[catKey] || catKey;

            return (
              <div
                key={catKey}
                className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-stone-700/80"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                    {categoryIcons[catKey]}
                    {catLabel}
                  </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">
                    {formatINR(catAmount)}
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden mt-2">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-stone-400 mt-1">
                  {pct}% of spending
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Ledger */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-orange-600" />
            {t.budget.recentExpenses} ({activeTrip.expenses.length})
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs font-semibold text-orange-600 hover:underline"
          >
            + Add New
          </button>
        </div>

        {activeTrip.expenses.length === 0 ? (
          <p className="text-xs text-stone-500 italic py-6 text-center">
            {t.budget.noExpenses}
          </p>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {activeTrip.expenses.map((exp: any) => {
              let parsedSplits: any[] = [];
              try {
                parsedSplits = exp.splitDetails ? JSON.parse(exp.splitDetails) : [];
              } catch {}

              return (
                <div
                  key={exp.id}
                  className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-stone-100 dark:bg-zinc-800 shrink-0 mt-0.5">
                      {categoryIcons[exp.category] || <MoreHorizontal className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                        {exp.title}
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{formatIndianDate(exp.expenseDate)}</span>
                        <span>•</span>
                        <span>Paid by {exp.paidBy}</span>
                        {parsedSplits.length > 1 && (
                          <>
                            <span>•</span>
                            <span className="text-teal-600 dark:text-teal-400 font-medium">
                              Split: {formatINR(parsedSplits[0]?.amount)} / person
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                      {formatINR(exp.amount)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      disabled={isDeletingId === exp.id}
                      className="text-stone-400 hover:text-red-600 p-1 rounded-md transition-colors cursor-pointer"
                      title="Remove expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-orange-600" />
                {t.budget.addExpense}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Description / Item
                </label>
                <input
                  type="text"
                  required
                  placeholder={t.budget.expenseTitlePlaceholder}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Amount and Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 850"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100"
                  >
                    <option value="FOOD">Food & Dining</option>
                    <option value="STAY">Stays & Hotels</option>
                    <option value="TRAVEL">Trains & Transit</option>
                    <option value="SHOPPING">Bazaars & Shopping</option>
                    <option value="ACTIVITIES">Monuments & Tours</option>
                    <option value="OTHER">Miscellaneous</option>
                  </select>
                </div>
              </div>

              {/* Paid By */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  {t.budget.paidBy}
                </label>
                <input
                  type="text"
                  value={paidBy}
                  onChange={(e) => setPaidBy(e.target.value)}
                  placeholder="e.g. You or Friend Name"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Split with companions */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1">
                  Split With (Comma separated)
                </label>
                <input
                  type="text"
                  value={companionsStr}
                  onChange={(e) => setCompanionsStr(e.target.value)}
                  placeholder="e.g. You, Rohan, Priya"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100"
                />
                {amount && companions.length > 0 && (
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium mt-1">
                    Equally split: {formatINR(splitAmount)} per companion ({companions.length} members)
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Add Expense</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

