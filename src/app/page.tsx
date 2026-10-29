"use client";

import React, { useState, useEffect } from "react";
import { Navbar, TabKey } from "@/components/Navbar";
import { PlannerTab } from "@/components/PlannerTab";
import { TripsTab } from "@/components/TripsTab";
import { BookingsTab } from "@/components/BookingsTab";
import { BudgetTab } from "@/components/BudgetTab";
import { SafetyTab } from "@/components/SafetyTab";
import { SettingsTab } from "@/components/SettingsTab";
import { formatINR, useI18n } from "@/i18n";
import { Heart } from "lucide-react";

export default function Home() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<TabKey>("plan");
  const [trips, setTrips] = useState<any[]>([]);
  const [activeTripId, setActiveTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await fetch("/api/trips");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTrips(json.data);
        if (json.data.length > 0) {
          // If active trip is not set or was deleted, default to first trip
          setActiveTripId((prev) => (json.data.some((tr: any) => tr.id === prev) ? prev : json.data[0].id));
        } else {
          setActiveTripId(null);
        }
      }
    } catch (e) {
      console.error("Failed to fetch trips", e);
    } finally {
      setIsLoading(false);
    }
  };

  const activeTrip = trips.find((tr) => tr.id === activeTripId) || trips[0];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Top Sticky Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeTripTitle={activeTrip?.destination || activeTrip?.title}
        remainingBudget={
          activeTrip?.budgetSummary
            ? formatINR(activeTrip.budgetSummary.remainingBudget)
            : undefined
        }
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === "plan" && (
          <PlannerTab
            onTripCreated={() => {
              fetchTrips();
              setActiveTab("trips");
            }}
          />
        )}

        {activeTab === "trips" && (
          <TripsTab
            trips={trips}
            activeTripId={activeTripId}
            onSelectActiveTrip={setActiveTripId}
            onRefreshTrips={fetchTrips}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === "explore" && (
          <BookingsTab
            trips={trips}
            activeTripId={activeTripId}
            onBookingConfirmed={() => {
              fetchTrips();
            }}
          />
        )}

        {activeTab === "budget" && (
          <BudgetTab
            trips={trips}
            activeTripId={activeTripId}
            onSelectActiveTrip={setActiveTripId}
            onRefreshTrips={fetchTrips}
          />
        )}

        {activeTab === "safety" && <SafetyTab />}

        {activeTab === "settings" && (
          <SettingsTab
            onDataReset={() => {
              fetchTrips();
              setActiveTab("plan");
            }}
          />
        )}
      </main>

      {/* Indian Travel Footer */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xs py-6 pb-24 sm:pb-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800 dark:text-stone-200">
              {t.app.name}
            </span>
            <span>•</span>
            <span>{t.app.disclaimer}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-orange-600 fill-orange-600 inline" />
            <span>for Indian travelers • DPDP Act 2023 Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
