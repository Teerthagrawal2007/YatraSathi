"use client";

import React, { useState, useEffect } from "react";
import { useI18n, formatINR } from "@/i18n";
import {
  ShoppingBag,
  Train,
  Building2,
  Compass,
  Star,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Loader2,
  Ticket,
  Sparkles,
  QrCode,
  User,
  ArrowRight,
  Printer,
  Copy,
  Info,
} from "lucide-react";

interface BookingOption {
  id: string;
  category: "TRAVEL" | "STAY" | "EXPERIENCE";
  title: string;
  destination: string;
  provider: string;
  price: number;
  isEstimated: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  description: string;
  features: string[];
  routeOrLocation: string;
  durationOrType: string;
}

interface BookingsTabProps {
  trips: any[];
  activeTripId: string | null;
  onBookingConfirmed?: () => void;
}

export function BookingsTab({ trips, activeTripId, onBookingConfirmed }: BookingsTabProps) {
  const { t } = useI18n();

  const [items, setItems] = useState<BookingOption[]>([]);
  const [category, setCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [searchSource, setSearchSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reservation Form Modal state
  const [selectedItem, setSelectedItem] = useState<BookingOption | null>(null);
  const [targetTripId, setTargetTripId] = useState<string>(activeTripId || (trips[0]?.id ?? ""));
  const [passengerName, setPassengerName] = useState("Teerth Sharma");
  const [passengerAge, setPassengerAge] = useState(25);
  const [seatPreference, setSeatPreference] = useState("Window / Lower Berth");
  const [attachExpense, setAttachExpense] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success Digital Voucher Modal
  const [confirmedVoucher, setConfirmedVoucher] = useState<{
    booking: any;
    voucher: any;
  } | null>(null);

  const quickAiPrompts = [
    { label: "🚅 Vande Bharat Delhi-Jaipur", q: "Vande Bharat Express train from New Delhi to Jaipur morning" },
    { label: "🏰 Udaipur Lakeview Haveli", q: "Heritage haveli in Udaipur with Lake Pichola view" },
    { label: "⛵ Kerala Luxury Houseboat", q: "Alleppey backwater traditional kettuvallam houseboat stay" },
    { label: "🏖️ South Goa Beach Resort", q: "Cozy beach resort in Palolem South Goa" },
    { label: "🏔️ Manali Solang Adventure", q: "Paragliding and snow activities in Solang Valley Manali" },
  ];

  useEffect(() => {
    fetchBookings();
  }, [category]);

  useEffect(() => {
    if (activeTripId) {
      setTargetTripId(activeTripId);
    } else if (trips.length > 0 && !targetTripId) {
      setTargetTripId(trips[0].id);
    }
  }, [activeTripId, trips]);

  const fetchBookings = async (queryText?: string, runWithAi = false) => {
    if (runWithAi) {
      setIsAiSearching(true);
    } else {
      setIsLoading(true);
    }

    try {
      const q = queryText !== undefined ? queryText : searchQuery;
      let url = `/api/bookings?category=${category}`;
      if (q) {
        url += `&q=${encodeURIComponent(q)}&ai=${runWithAi ? "true" : "false"}`;
      }

      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
        setSearchSource(json.source || null);
      }
    } catch (e) {
      console.error("Failed to load bookings", e);
    } finally {
      setIsLoading(false);
      setIsAiSearching(false);
    }
  };

  const handleAiSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      fetchBookings("", false);
      return;
    }
    fetchBookings(searchQuery, true);
  };

  const handleQuickPrompt = (q: string) => {
    setSearchQuery(q);
    fetchBookings(q, true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedItem) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: targetTripId || undefined,
          category: selectedItem.category,
          title: selectedItem.title,
          provider: selectedItem.provider,
          price: selectedItem.price,
          isEstimated: true,
          bookingDate: new Date().toISOString(),
          attachExpense,
          passenger: {
            name: passengerName.trim() || "Traveler",
            age: Number(passengerAge) || 25,
            seatPreference,
          },
          details: {
            destination: selectedItem.destination,
            durationOrType: selectedItem.durationOrType,
            routeOrLocation: selectedItem.routeOrLocation,
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setConfirmedVoucher({
          booking: json.data,
          voucher: json.voucher,
        });
        setSelectedItem(null);
        if (onBookingConfirmed) {
          onBookingConfirmed();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Gemini AI Travel & Booking Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          {t.explore.title}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          Search real trains, heritage stays, and experiences powered by Gemini AI with official digital ticket vouchers.
        </p>
      </div>

      {/* AI Search Bar Box */}
      <div className="p-5 rounded-2xl bg-linear-to-r from-orange-50 via-amber-50 to-stone-50 dark:from-zinc-900 dark:via-zinc-850 dark:to-zinc-900 border border-orange-200/80 dark:border-stone-800 shadow-xs space-y-4">
        <form onSubmit={handleAiSearchSubmit} className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search or prompt Gemini: e.g. Vande Bharat Delhi to Jaipur, Lake view haveli in Udaipur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-xs"
            />
          </div>

          <button
            type="submit"
            disabled={isAiSearching}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isAiSearching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Searching with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Search with AI</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Prompt Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            Quick AI Searches:
          </span>
          {quickAiPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickPrompt(p.q)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/80 dark:bg-zinc-800 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:border-orange-500 hover:text-orange-600 transition-colors cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Pills & Source Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-stone-700 overflow-x-auto w-full sm:w-auto">
          {[
            { id: "ALL", label: t.explore.tabs.all },
            { id: "TRAVEL", label: t.explore.tabs.travel },
            { id: "STAY", label: t.explore.tabs.stay },
            { id: "EXPERIENCE", label: t.explore.tabs.experience },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                category === cat.id
                  ? "bg-white dark:bg-zinc-900 text-orange-600 dark:text-orange-400 font-bold shadow-xs"
                  : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {searchSource === "gemini" && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-medium animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Verified Results via Gemini</span>
          </div>
        )}
      </div>

      {/* Booking Cards Grid */}
      {isLoading || isAiSearching ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-xs text-stone-500">
            {isAiSearching ? "Gemini is discovering verified travel options..." : t.common.loading}
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800">
          <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-stone-700 dark:text-stone-300">
            No curations matched your search.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              fetchBookings("", false);
            }}
            className="mt-3 text-xs font-semibold text-orange-600 hover:underline"
          >
            Reset to all verified curations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-44 w-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-stone-900/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                      {item.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500 text-stone-950 text-[10px] font-bold">
                      {item.badge}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span>{item.rating || 4.8}</span>
                    <span className="text-stone-400 text-[10px]">({item.reviewsCount || 820})</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 font-medium">
                    <span>{item.destination}</span>
                    <span>•</span>
                    <span>{item.durationOrType}</span>
                  </div>

                  <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 mt-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {/* Feature Pills */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.features?.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-zinc-800 text-[10px] font-medium text-stone-600 dark:text-stone-400"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price & Action Footer */}
              <div className="px-5 py-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between bg-stone-50/50 dark:bg-zinc-850/50">
                <div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider block font-semibold">
                    {t.explore.estimatedBadge}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-stone-900 dark:text-stone-100">
                      {formatINR(item.price)}
                    </span>
                    <span className="text-[10px] text-stone-400">/ estimated</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedItem(item)}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Ticket className="w-3.5 h-3.5" />
                  <span>Reserve & Issue Ticket</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reservation & Passenger Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="max-w-lg w-full bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-orange-600" />
                Reserve {selectedItem.category} with Gemini Voucher
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-stone-400 hover:text-stone-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Service Summary Banner */}
            <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-stone-700">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                {selectedItem.provider}
              </span>
              <h4 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                {selectedItem.title}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                {selectedItem.routeOrLocation} • {selectedItem.durationOrType}
              </p>
            </div>

            {/* Passenger / Guest Details Form */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-600 dark:text-stone-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                Passenger / Guest Details
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="e.g. Teerth Sharma"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={passengerAge}
                    onChange={(e) => setPassengerAge(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Seat / Berth / Room Preference
                </label>
                <input
                  type="text"
                  value={seatPreference}
                  onChange={(e) => setSeatPreference(e.target.value)}
                  placeholder="e.g. Window Seat, Lower Berth, High Floor"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              {/* Attach to Trip */}
              {trips.length > 0 && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Link to Journey Dashboard:
                  </label>
                  <select
                    value={targetTripId}
                    onChange={(e) => setTargetTripId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-zinc-800 text-xs font-medium text-stone-800 dark:text-stone-200"
                  >
                    {trips.map((tr) => (
                      <option key={tr.id} value={tr.id}>
                        {tr.title} ({tr.destination})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Checkbox: Auto Add to Budget */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="attachExpense"
                  checked={attachExpense}
                  onChange={(e) => setAttachExpense(e.target.checked)}
                  className="rounded-md border-stone-300 text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <label
                  htmlFor="attachExpense"
                  className="text-xs text-stone-700 dark:text-stone-300 select-none cursor-pointer"
                >
                  Automatically record this {formatINR(selectedItem.price)} reservation as a Trip Expense
                </label>
              </div>
            </div>

            {/* Price banner */}
            <div className="p-3.5 rounded-xl bg-orange-50/70 dark:bg-zinc-800 border border-orange-200/60 dark:border-stone-700 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                  Estimated Fare / Tariff
                </span>
                <span className="text-[10px] text-stone-500">
                  Includes digital AI ticket allocation with valid PNR
                </span>
              </div>
              <span className="text-lg font-extrabold text-orange-600 dark:text-orange-400">
                {formatINR(selectedItem.price)}
              </span>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Allocating Seat with Gemini...</span>
                  </>
                ) : (
                  <span>Confirm & Generate Ticket</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Digital Ticket / Boarding Pass Modal */}
      {confirmedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-8">
            {/* Ticket Header */}
            <div className="bg-linear-to-r from-orange-600 via-amber-600 to-orange-700 p-5 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  <span className="text-xs font-extrabold uppercase tracking-widest">
                    YatraSathi E-Ticket
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                  Confirmed (Mock)
                </span>
              </div>

              <div className="mt-3">
                <span className="text-[11px] text-orange-100 font-medium uppercase tracking-wider">
                  {confirmedVoucher.booking.provider}
                </span>
                <h3 className="font-extrabold text-lg text-white">
                  {confirmedVoucher.booking.title}
                </h3>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 space-y-4">
              {/* PNR and Seat Row */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-zinc-800/60 border border-stone-200/80 dark:border-stone-700">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    PNR / Ref Number
                  </span>
                  <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100">
                    {confirmedVoucher.voucher.pnrNumber || confirmedVoucher.voucher.bookingRef}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Assigned Berth / Room
                  </span>
                  <span className="font-bold text-sm text-orange-600 dark:text-orange-400">
                    {confirmedVoucher.voucher.assignedSeatOrRoom}
                  </span>
                </div>
              </div>

              {/* Passenger and Reporting */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-stone-500">Passenger / Guest:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {confirmedVoucher.voucher.passengerName} (Age: {confirmedVoucher.voucher.passengerAge})
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-stone-500">Coach / Wing:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {confirmedVoucher.voucher.coachOrBuilding || "Main Block"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-stone-500">Timing:</span>
                  <span className="font-bold text-stone-800 dark:text-stone-200">
                    {confirmedVoucher.voucher.boardingOrCheckInTime}
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
                  <span className="text-stone-500">Fare Paid (Estimated):</span>
                  <span className="font-extrabold text-stone-900 dark:text-stone-100">
                    {formatINR(confirmedVoucher.booking.price)}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                <span className="font-bold block">Boarding & Reporting Notice:</span>
                <span className="text-amber-800 dark:text-amber-300">
                  {confirmedVoucher.voucher.reportingInstructions}
                </span>
              </div>

              {/* AI Traveler Tip */}
              {confirmedVoucher.voucher.aiTravelerTip && (
                <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[11px] text-teal-900 dark:text-teal-200">
                  <span className="font-bold flex items-center gap-1 text-teal-800 dark:text-teal-100 mb-0.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    Gemini Travel Tip:
                  </span>
                  <span>{confirmedVoucher.voucher.aiTravelerTip}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Ticket</span>
                </button>
                <button
                  onClick={() => setConfirmedVoucher(null)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
