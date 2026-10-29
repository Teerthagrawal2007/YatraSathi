"use client";

import React, { useState } from "react";
import { useI18n, formatINR } from "@/i18n";
import { getAiHeaders } from "@/i18n/aiClient";
import { PlannerOutput } from "@/server/schemas/planner";
import {
  Sparkles,
  MapPin,
  Calendar,
  IndianRupee,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  Shield,
  Briefcase,
  Utensils,
  AlertCircle,
  BookmarkPlus,
  Loader2,
} from "lucide-react";

interface PlannerTabProps {
  onTripCreated?: () => void;
}

export function PlannerTab({ onTripCreated }: PlannerTabProps) {
  const { t } = useI18n();

  // Form states
  const [destination, setDestination] = useState("Jaipur");
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState(25000);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState<"budget" | "balanced" | "luxury" | "backpacking" | "family">("balanced");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Heritage", "Food"]);

  // Request & Plan states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlannerOutput | null>(null);
  const [planSource, setPlanSource] = useState<"gemini" | "deterministic_mock" | null>(null);
  const [aiStatus, setAiStatus] = useState<any | null>(null);
  const [isCheckingAi, setIsCheckingAi] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Check Gemini status on mount
  React.useEffect(() => {
    checkAiHealth();
  }, []);

  const checkAiHealth = async () => {
    setIsCheckingAi(true);
    try {
      const res = await fetch("/api/ai/status", {
        headers: getAiHeaders(),
      });
      const json = await res.json();
      setAiStatus(json);
    } catch {
      setAiStatus({ connected: false });
    } finally {
      setIsCheckingAi(false);
    }
  };

  const popularDestinations = ["Jaipur", "Munnar", "Varanasi", "Manali", "Goa", "Udaipur"];
  const interestOptions = [
    { id: "Heritage", label: "Forts & Heritage" },
    { id: "Food", label: "Street Food & Cuisine" },
    { id: "Spiritual", label: "Temples & Ghats" },
    { id: "Nature", label: "Backwaters & Nature" },
    { id: "Adventure", label: "Trekking & Adventure" },
  ];

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((item) => item !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim()) {
      setError("Please specify an Indian destination.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAiHeaders() },
        body: JSON.stringify({
          destination: destination.trim(),
          days: Number(days),
          budget: Number(budget),
          travelers: Number(travelers),
          travelStyle,
          interests: selectedInterests,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || json.error || "Failed to generate plan");
      }

      setPlan(json.data);
      setPlanSource(json.source || "gemini");
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while planning.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!plan) return;
    setIsSaving(true);
    setError(null);

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7); // Default 1 week from now
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + plan.durationDays);

      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${plan.destination} Discovery (${plan.durationDays} Days)`,
          destination: plan.destination,
          state: "India",
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
          totalBudget: plan.totalEstimatedCostINR,
          currency: "INR",
          itinerary: plan,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to save trip");
      }

      setSaveSuccess(true);
      if (onTripCreated) {
        onTripCreated();
      }
    } catch (err: any) {
      setError(err?.message || "Failed to save trip to dashboard");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Title Header */}
      <div className="text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Itinerary Generator</span>
          </div>

          {/* Gemini AI Status Indicator */}
          <div className="inline-flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={checkAiHealth}
              disabled={isCheckingAi}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
              title="Click to re-check Gemini API connection"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus?.connected ? "bg-teal-500 animate-pulse" : "bg-amber-500"
                }`}
              />
              <span className="font-medium">
                {isCheckingAi
                  ? "Pinging Gemini..."
                  : aiStatus?.connected
                  ? `Gemini AI: Connected (${aiStatus.latencyMs}ms)`
                  : "Gemini AI: Fallback Mode"}
              </span>
            </button>
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          {t.planner.title}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {t.planner.subtitle}
        </p>
      </div>

      {/* Generator Form */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-sm transition-all">
        <form onSubmit={handleGenerate} className="space-y-6">
          {/* Destination */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              {t.planner.destinationLabel}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t.planner.destinationPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500 transition-all"
                required
              />
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                {t.planner.popularChips}
              </span>
              {popularDestinations.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setDestination(city)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    destination.toLowerCase() === city.toLowerCase()
                      ? "bg-orange-600 text-white"
                      : "bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-zinc-700"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Duration, Budget, Travelers */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Days */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                {t.planner.daysLabel}
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={days}
                  onChange={(e) => setDays(Math.max(1, Math.min(14, Number(e.target.value))))}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                {t.planner.budgetLabel}
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  step="1000"
                  min="2000"
                  max="500000"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>

            {/* Travelers */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
                {t.planner.travelersLabel}
              </label>
              <div className="relative">
                <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={travelers}
                  onChange={(e) => setTravelers(Math.max(1, Math.min(10, Number(e.target.value))))}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Travel Style */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              {t.planner.styleLabel}
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value as any)}
              className="w-full px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-orange-500"
            >
              <option value="budget">{t.planner.styles.budget}</option>
              <option value="balanced">{t.planner.styles.balanced}</option>
              <option value="luxury">{t.planner.styles.luxury}</option>
              <option value="backpacking">{t.planner.styles.backpacking}</option>
              <option value="family">{t.planner.styles.family}</option>
            </select>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-2">
              {t.planner.interestsLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map((opt) => {
                const active = selectedInterests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleInterest(opt.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      active
                        ? "bg-amber-100 dark:bg-amber-950/80 border-amber-400 text-amber-900 dark:text-amber-200"
                        : "bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:border-stone-400"
                    }`}
                  >
                    {active ? "✓ " : "+ "}
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-linear-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold text-sm shadow-md shadow-orange-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.planner.generating}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.planner.planButton}</span>
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Generated Itinerary Display */}
      {plan && (
        <div className="space-y-6 animate-fade-in">
          {/* Overview Banner */}
          <div className="p-6 rounded-2xl bg-linear-to-br from-orange-50 via-amber-50 to-stone-50 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-orange-200/80 dark:border-stone-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 rounded-md bg-orange-600 text-white text-[11px] font-bold uppercase tracking-wider">
                    {plan.destination} • {plan.durationDays} Days
                  </span>
                  {planSource === "gemini" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                      Live Gemini AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 text-[11px] font-medium">
                      Offline Indian Travel Brain
                    </span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
                  {plan.destination} Itinerary
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 max-w-2xl">
                  {plan.overview}
                </p>
              </div>

              <div className="sm:text-right shrink-0 bg-white/80 dark:bg-zinc-800/80 p-4 rounded-xl border border-stone-200/80 dark:border-stone-700">
                <span className="text-xs text-stone-500 dark:text-stone-400 block font-medium">
                  {t.common.estimated} Total Cost
                </span>
                <span className="text-2xl font-extrabold text-orange-600 dark:text-orange-400">
                  {formatINR(plan.totalEstimatedCostINR)}
                </span>
                <span className="block text-[10px] text-stone-400 dark:text-stone-500 mt-0.5">
                  ({formatINR(Math.round(plan.totalEstimatedCostINR / plan.durationDays))} / day avg)
                </span>
              </div>
            </div>

            {/* Quick Meta Pills */}
            <div className="mt-4 pt-4 border-t border-orange-200/60 dark:border-stone-800 flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                Best Season:
              </span>
              <span className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 font-medium">
                {plan.bestTimeToVisit}
              </span>
            </div>

            {/* Regional Cuisine */}
            {plan.localCuisine && plan.localCuisine.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  <Utensils className="w-3.5 h-3.5 text-orange-500" />
                  {t.planner.localCuisine}:
                </span>
                {plan.localCuisine.map((dish, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-orange-100/70 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[11px]"
                  >
                    {dish}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Day By Day Cards */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              Day-by-Day Travel Schedule
            </h3>

            {plan.days.map((day) => (
              <div
                key={day.day}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-sm">
                      D{day.day}
                    </span>
                    <div>
                      <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                        {t.planner.dayTitle} {day.day}: {day.theme}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md">
                    Est: {formatINR(day.dailyEstimatedCostINR)}
                  </span>
                </div>

                {/* Activities: Morning, Afternoon, Evening */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {day.activities.map((act, actIdx) => (
                    <div
                      key={actIdx}
                      className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/70 dark:border-stone-700/60 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs text-orange-600 dark:text-orange-400 font-semibold mb-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {act.time}
                          </span>
                          <span>{formatINR(act.estimatedCostINR)}</span>
                        </div>
                        <h5 className="font-bold text-stone-900 dark:text-stone-100 text-xs sm:text-sm">
                          {act.title}
                        </h5>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 leading-relaxed">
                          {act.description}
                        </p>
                      </div>

                      {act.tips && (
                        <div className="mt-3 pt-2 border-t border-stone-200/50 dark:border-stone-700/40 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                          💡 {act.tips}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Packing & Safety Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Packing Essentials */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-orange-600" />
                {t.planner.packingList}
              </h4>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                {plan.packingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety & Emergency */}
            <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800">
              <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-teal-600" />
                {t.planner.safetyTips}
              </h4>
              <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                {plan.safetyTips.slice(0, 4).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-500 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Save Trip Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-sm">
            <div>
              <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm">
                Ready to embark on this journey?
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Save this itinerary to track live expenses, book trains/havelis, and activate safety tracking.
              </p>
            </div>

            <button
              onClick={handleSaveTrip}
              disabled={isSaving || saveSuccess}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${
                saveSuccess
                  ? "bg-teal-600 text-white cursor-default"
                  : "bg-orange-600 hover:bg-orange-700 text-white shadow-sm shadow-orange-600/30"
              }`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.planner.savedSuccess}</span>
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{t.planner.saveTrip}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
