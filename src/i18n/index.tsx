"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Locale } from "./translations";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: typeof translations["en"];
  formatDate: (date: Date | string | number) => string;
  formatINR: (amount: number) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

/**
 * Format dates strictly in DD MMM YYYY with Asia/Kolkata timezone
 * e.g., "12 Nov 2026"
 */
export function formatIndianDate(dateInput: Date | string | number): string {
  try {
    const d = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

/**
 * Format currency into Indian Rupees (INR)
 * e.g. ₹1,25,000
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

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("yatrasathi_lang") as Locale;
    if (saved === "en" || saved === "hi") {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("yatrasathi_lang", l);
  };

  const t = translations[locale] || translations.en;

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t,
        formatDate: formatIndianDate,
        formatINR,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
