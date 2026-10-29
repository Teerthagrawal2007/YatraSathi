"use client";

import React, { useState } from "react";
import { useI18n, formatIndianDate, formatINR } from "@/i18n";
import {
  Compass,
  Calendar,
  MapPin,
  IndianRupee,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  Ticket,
  ChevronRight,
  PlusCircle,
  ArrowUpRight,
} from "lucide-react";

interface TripItem {
  id: string;
  title: string;
  destination: string;
  state: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  durationDays: number;
  coverImage?: string;
  status: string;
  expenses: any[];
  bookings: any[];
  itineraryJson?: string;
  budgetSummary: {
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    percentSpent: number;
    isOverBudget: boolean;
  };
}

interface TripsTabProps {
  trips: TripItem[];
  activeTripId: string | null;
  onSelectActiveTrip: (id: string) => void;
  onRefreshTrips: () => void;
  onNavigateToTab: (tab: any) => void;
}

export function TripsTab({
  trips,
  activeTripId,
  onSelectActiveTrip,
  onRefreshTrips,
  onNavigateToTab,
}: TripsTabProps) {
  const { t } = useI18n();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const activeTrip = trips.find((tr) => tr.id === activeTripId) || trips[0];

  const handleDeleteTrip = async (id: string) => {
    if (!confirm("Are you sure you want to remove this trip?")) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
      if (res.ok) {
        onRefreshTrips();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleDownloadItinerary = (trip: TripItem) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(trip, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${trip.destination.replace(/[\s,]+/g, "_")}_YatraSathi_Plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
            {t.nav.trips} Dashboard
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Manage your saved journeys, review reservations, and track day plans.
          </p>
        </div>

        <button
          onClick={() => onNavigateToTab("plan")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Plan New Trip</span>
        </button>
      </div>

      {trips.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-stone-300 dark:border-stone-800">
          <Compass className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="font-bold text-base text-stone-800 dark:text-stone-200">
            No journeys planned yet
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1 mb-4">
            Use the AI Planner to design an authentic Indian adventure with tailored budgets and local cultural stops.
          </p>
          <button
            onClick={() => onNavigateToTab("plan")}
            className="px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700"
          >
            Create Your First Itinerary
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Trips List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              Your Journeys ({trips.length})
            </h3>
            {trips.map((tr) => {
              const isSelected = activeTrip?.id === tr.id;
              return (
                <div
                  key={tr.id}
                  onClick={() => onSelectActiveTrip(tr.id)}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-orange-50/80 dark:bg-zinc-800/90 border-orange-500 ring-1 ring-orange-500"
                      : "bg-white dark:bg-zinc-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                        {tr.destination}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 line-clamp-1">
                        {tr.title}
                      </h4>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 mt-1" />
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-3 text-xs text-stone-500 dark:text-stone-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {tr.durationDays} Days
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-stone-700 dark:text-stone-300">
                      {formatINR(tr.totalBudget)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Active Trip Detail Showcase */}
          {activeTrip && (
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs">
                {/* Image & Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-stone-100 dark:border-stone-800">
                  <div>
                    <span className="px-2.5 py-1 rounded-md bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wider">
                      Active Trip
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">
                      {activeTrip.title}
                    </h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      <span>{activeTrip.destination}</span>
                      <span>•</span>
                      <span>
                        {formatIndianDate(activeTrip.startDate)} – {formatIndianDate(activeTrip.endDate)}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadItinerary(activeTrip)}
                      className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-zinc-800 text-stone-600 dark:text-stone-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download Itinerary JSON"
                    >
                      <Download className="w-4 h-4 text-stone-500" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(activeTrip.id)}
                      disabled={isDeleting === activeTrip.id}
                      className="p-2 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 text-xs font-medium transition-colors cursor-pointer"
                      title="Delete Trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Budget Gauge */}
                <div className="py-6 border-b border-stone-100 dark:border-stone-800">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">
                      Budget Utilization
                    </span>
                    <span className="font-bold text-stone-900 dark:text-stone-100">
                      {activeTrip.budgetSummary.percentSpent}% Spent
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-3 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        activeTrip.budgetSummary.percentSpent > 90
                          ? "bg-red-500"
                          : activeTrip.budgetSummary.percentSpent > 70
                          ? "bg-amber-500"
                          : "bg-teal-600"
                      }`}
                      style={{ width: `${Math.min(100, activeTrip.budgetSummary.percentSpent)}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60">
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                        Total Budget
                      </span>
                      <span className="text-sm font-bold text-stone-800 dark:text-stone-200">
                        {formatINR(activeTrip.totalBudget)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60">
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                        Spent
                      </span>
                      <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                        {formatINR(activeTrip.budgetSummary.totalSpent)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-zinc-800/60">
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block">
                        Remaining
                      </span>
                      <span className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        {formatINR(activeTrip.budgetSummary.remainingBudget)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-right">
                    <button
                      onClick={() => onNavigateToTab("budget")}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline"
                    >
                      <span>Manage Expenses & Splits</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Confirmed Reservations & Bookings */}
                <div className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-orange-600" />
                      Bookings & Reservations ({activeTrip.bookings.length})
                    </h4>
                    <button
                      onClick={() => onNavigateToTab("explore")}
                      className="text-xs font-semibold text-orange-600 hover:underline"
                    >
                      + Add Booking
                    </button>
                  </div>

                  {activeTrip.bookings.length === 0 ? (
                    <p className="text-xs text-stone-500 dark:text-stone-400 italic">
                      No reservations attached yet. Explore trains, havelis, and safaris to mock-book.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {activeTrip.bookings.map((b) => {
                        let parsedDetails: any = null;
                        try {
                          parsedDetails = b.detailsJson ? JSON.parse(b.detailsJson) : null;
                        } catch {}

                        return (
                          <div
                            key={b.id}
                            className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-zinc-800/40 flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-stone-200">
                                  {b.category}
                                </span>
                                <h5 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                                  {b.title}
                                </h5>
                              </div>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                Provider: {b.provider}{" "}
                                {parsedDetails?.coach && (
                                  <span>
                                    • Coach {parsedDetails.coach}, Seats:{" "}
                                    {parsedDetails.seatNumbers?.join(", ")}
                                  </span>
                                )}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                                {formatINR(b.price)}
                              </span>
                              <span className="block text-[10px] font-medium text-teal-600 dark:text-teal-400">
                                Confirmed Mock
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

