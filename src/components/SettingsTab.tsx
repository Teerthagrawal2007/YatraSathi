"use client";

import React, { useState, useEffect } from "react";
import { useI18n } from "@/i18n";
import { useTheme } from "@/components/ThemeProvider";
import { getAiHeaders, getStoredGeminiKey, setStoredGeminiKey } from "@/i18n/aiClient";
import {
  Settings,
  Languages,
  Moon,
  Sun,
  ShieldCheck,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Info,
  Code2,
  Sparkles,
  Key,
} from "lucide-react";

interface SettingsTabProps {
  onDataReset?: () => void;
}

export function SettingsTab({ onDataReset }: SettingsTabProps) {
  const { locale, setLocale, t } = useI18n();
  const { theme, setTheme } = useTheme();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isCheckingAi, setIsCheckingAi] = useState(false);
  const [aiCheckResult, setAiCheckResult] = useState<any | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [keySavedStatus, setKeySavedStatus] = useState<string | null>(null);

  useEffect(() => {
    setApiKeyInput(getStoredGeminiKey());
  }, []);

  const handleSaveApiKey = () => {
    setStoredGeminiKey(apiKeyInput);
    setKeySavedStatus("Key saved! Re-testing AI connection...");
    setTimeout(() => setKeySavedStatus(null), 3000);
    checkGeminiStatus();
  };

  const checkGeminiStatus = async () => {
    setIsCheckingAi(true);
    try {
      const res = await fetch("/api/ai/status", {
        headers: getAiHeaders(),
      });
      const json = await res.json();
      setAiCheckResult(json);
    } catch (e: any) {
      setAiCheckResult({ connected: false, message: e.message || "Network error" });
    } finally {
      setIsCheckingAi(false);
    }
  };

  useEffect(() => {
    checkGeminiStatus();
  }, []);

  const handleDeleteData = async () => {
    setIsDeleting(true);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/user/delete-data", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setSuccessMessage(t.settings.deletedSuccess);
        setShowConfirmModal(false);
        if (onDataReset) {
          onDataReset();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 text-xs font-semibold mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Preferences & Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          {t.settings.title}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Preferences Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 border-b border-stone-100 dark:border-stone-800 pb-3">
          App Preferences
        </h3>

        {/* Language Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-bold text-sm text-stone-800 dark:text-stone-200 flex items-center gap-2">
              <Languages className="w-4 h-4 text-orange-600" />
              {t.settings.language}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
              Switch entire UI and Indian currency formatting between English and Hindi
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLocale("en")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                locale === "en"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLocale("hi")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                locale === "hi"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* Theme Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
          <div>
            <span className="font-bold text-sm text-stone-800 dark:text-stone-200 flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-4 h-4 text-orange-600" /> : <Sun className="w-4 h-4 text-orange-600" />}
              {t.settings.theme}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
              Toggle between warm parchment light mode and dark OLED theme
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                theme === "light"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                theme === "dark"
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200"
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* DPDP Act 2023 Compliance & Data Erasure */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
            {t.settings.privacyTitle}
          </h3>
        </div>

        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
          {t.settings.privacyBody}
        </p>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs text-teal-800 dark:text-teal-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="pt-2">
          <button
            onClick={() => setShowConfirmModal(true)}
            className="px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.settings.deleteDataBtn}</span>
          </button>
        </div>
      </div>

      {/* Gemini AI Status & Diagnostics */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/70 text-orange-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Google Gemini AI Integration Status
              </h3>
              <span className="text-xs text-stone-500">Live API health check & diagnostics</span>
            </div>
          </div>

          <button
            onClick={checkGeminiStatus}
            disabled={isCheckingAi}
            className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-zinc-800 text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isCheckingAi ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                <span>Test Connection</span>
              </>
            )}
          </button>
        </div>

        {aiCheckResult ? (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              aiCheckResult.connected
                ? "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200"
                : "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200"
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  aiCheckResult.connected ? "bg-teal-500 animate-pulse" : "bg-red-500"
                }`}
              />
              <span>
                {aiCheckResult.connected
                  ? `Gemini AI is Connected and Active (${aiCheckResult.latencyMs}ms)`
                  : "Gemini API Connection Failed"}
              </span>
            </div>

            <p className="leading-relaxed text-[11px]">
              {aiCheckResult.message}
            </p>

            {aiCheckResult.model && (
              <div className="pt-2 border-t border-teal-200/60 dark:border-teal-800/60 grid grid-cols-2 gap-2 text-[11px]">
                <div>• Active Model: <span className="font-mono font-bold">{aiCheckResult.model}</span></div>
                <div>• Key Configured: <span className="font-mono">{aiCheckResult.keyMasked}</span></div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/70 text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
            <span>Click &quot;Test Connection&quot; to ping Gemini API live.</span>
          </div>
        )}

        <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/70 border border-stone-200 dark:border-stone-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-orange-600" />
              <span>Gemini API Key (Local Browser & Live Sync)</span>
            </label>
            {keySavedStatus && (
              <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                {keySavedStatus}
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter Gemini API key (AIzaSy...)"
              className="flex-1 px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
            />
            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer transition-colors shrink-0 shadow-xs"
            >
              Save & Test
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            Stored locally in your browser so you get 100% live Gemini AI itineraries and vouchers even on public Vercel links without needing backend env setup.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/60 text-[11px] text-stone-500 space-y-1">
          <span className="font-semibold block text-stone-700 dark:text-stone-300">💡 Vercel / Cloud Deployment Tip:</span>
          <span>When deploying to Vercel, make sure you have added <code className="font-mono font-semibold">GEMINI_API_KEY</code> under <strong>Vercel Project Settings ➔ Environment Variables</strong>.</span>
        </div>
      </div>

      {/* System Architecture info */}
      <div className="p-6 rounded-2xl bg-stone-50 dark:bg-zinc-850/60 border border-stone-200/80 dark:border-stone-800 text-xs space-y-3">
        <h4 className="font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
          <Code2 className="w-4 h-4 text-orange-600" />
          YatraSathi Architecture Specs
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-stone-600 dark:text-stone-400">
          <div>• Framework: Next.js 16 (App Router & Turbopack)</div>
          <div>• Runtime: React 19 + TypeScript + Tailwind CSS</div>
          <div>• Database: Prisma ORM with SQLite (dev.db)</div>
          <div>• AI Engine: Google Gemini API + Deterministic Fallback</div>
          <div>• Compliance: India DPDP Act 2023 Explicit Consent</div>
          <div>• Currency & Locales: Strictly ₹ INR & Asia/Kolkata Timezone</div>
        </div>
      </div>

      {/* Erasure Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Confirm Data Erasure
              </h3>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400">
              {t.settings.deleteConfirm}
            </p>

            <div className="flex items-center gap-3 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400 text-xs font-semibold cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleDeleteData}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Erasing...</span>
                  </>
                ) : (
                  <span>Yes, Delete Everything</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

