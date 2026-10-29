"use client";

import React, { useState } from "react";
import { useI18n } from "@/i18n";
import { useTheme } from "@/components/ThemeProvider";
import {
  Compass,
  MapPin,
  Wallet,
  ShieldAlert,
  Settings,
  Moon,
  Sun,
  Languages,
  Sparkles,
  ShoppingBag,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  X,
  Wifi,
  Globe,
} from "lucide-react";

export type TabKey = "plan" | "trips" | "explore" | "budget" | "safety" | "settings";

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  activeTripTitle?: string;
  remainingBudget?: string;
}

export function Navbar({ activeTab, onTabChange, activeTripTitle, remainingBudget }: NavbarProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, toggleTheme } = useTheme();

  const [showMobileModal, setShowMobileModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic host detection or pre-detected Wi-Fi address
  const localWifiIp = "192.168.1.28";
  const mobileUrl = typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? `${window.location.protocol}//${window.location.host}`
    : `http://${localWifiIp}:3000`;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(mobileUrl)}`;

  const navItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: "plan", label: t.nav.plan, icon: <Sparkles className="w-4 h-4" /> },
    { key: "trips", label: t.nav.trips, icon: <Compass className="w-4 h-4" /> },
    { key: "explore", label: t.nav.explore, icon: <ShoppingBag className="w-4 h-4" /> },
    { key: "budget", label: t.nav.budget, icon: <Wallet className="w-4 h-4" /> },
    { key: "safety", label: t.nav.safety, icon: <ShieldAlert className="w-4 h-4" /> },
    { key: "settings", label: t.nav.settings, icon: <Settings className="w-4 h-4" /> },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(mobileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 border-b border-stone-200 dark:border-stone-800 shadow-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              onClick={() => onTabChange("plan")}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-amber-600 to-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xl tracking-tight text-stone-900 dark:text-stone-100">
                    {t.app.name}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-sm bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                    India
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 hidden sm:block">
                  {t.app.tagline}
                </p>
              </div>
            </div>

            {/* Center Trip Pill if available */}
            {activeTripTitle && (
              <div
                onClick={() => onTabChange("trips")}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-xs cursor-pointer hover:border-orange-400 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0" />
                <span className="font-medium text-stone-700 dark:text-stone-200 truncate max-w-[200px]">
                  {activeTripTitle}
                </span>
                {remainingBudget && (
                  <span className="ml-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-semibold text-[11px]">
                    {remainingBudget} left
                  </span>
                )}
              </div>
            )}

            {/* Right Controls: Mobile Link Button, Language & Theme Toggle */}
            <div className="flex items-center gap-2">
              {/* Mobile Link / QR Button */}
              <button
                onClick={() => setShowMobileModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-semibold hover:bg-orange-100 dark:hover:bg-orange-950/70 transition-colors cursor-pointer"
                title="Open on Mobile Phone"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile Link</span>
              </button>

              {/* Language Toggle */}
              <button
                onClick={() => setLocale(locale === "en" ? "hi" : "en")}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-xs font-medium text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                title="Change Language"
              >
                <Languages className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>{locale === "en" ? "हिंदी" : "English"}</span>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-stone-600" />
                )}
              </button>
            </div>
          </div>

          {/* Desktop / Tablet Navigation Tabs */}
          <nav className="hidden sm:flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar border-t border-stone-100 dark:border-stone-800/60">
            {navItems.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onTabChange(item.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Native App-Style Mobile Bottom Navigation Bar (Visible on mobile screens) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 flex justify-around py-1.5 px-2 shadow-lg">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition-all min-w-[50px] ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 font-bold"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              <div
                className={`p-1 rounded-md mb-0.5 ${
                  isActive ? "bg-orange-100 dark:bg-orange-950/80" : ""
                }`}
              >
                {item.icon}
              </div>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Mobile View & QR Code Modal */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-orange-600" />
                Open on Mobile Phone
              </h3>
              <button
                onClick={() => setShowMobileModal(false)}
                className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* QR Code */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 inline-block mx-auto shadow-inner">
              <img
                src={qrCodeUrl}
                alt="Mobile QR Code"
                className="w-44 h-44 mx-auto rounded-lg"
              />
            </div>

            <div>
              <span className="text-xs text-stone-500 dark:text-stone-400 block">
                Point your phone's camera at the QR code above or use this link:
              </span>

              {/* Direct Wi-Fi Link Box */}
              <div className="flex items-center justify-between gap-2 p-2.5 mt-2 rounded-xl bg-stone-100 dark:bg-zinc-800 border border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-stone-800 dark:text-stone-200 truncate">
                  <Wifi className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="truncate">{mobileUrl}</span>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Network Note */}
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 text-left space-y-1">
              <span className="font-bold block">💡 Important Connection Tip:</span>
              <p className="text-amber-800 dark:text-amber-300">
                Your mobile phone must be connected to the <strong>same Wi-Fi network</strong> as this computer to open this local address.
              </p>
              <p className="text-amber-800 dark:text-amber-300">
                To test on mobile from anywhere (e.g. on 4G/5G mobile data), you can run:{" "}
                <code className="font-mono bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded-sm">
                  npx localtunnel --port 3000
                </code>
              </p>
            </div>

            <button
              onClick={() => setShowMobileModal(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
