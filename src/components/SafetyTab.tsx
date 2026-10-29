"use client";

import React, { useState, useEffect } from "react";
import { useI18n, formatIndianDate } from "@/i18n";
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Loader2,
  ShieldCheck,
  Radio,
  ExternalLink,
} from "lucide-react";

export function SafetyTab() {
  const { t } = useI18n();

  // SOS state
  const [isSosLoading, setIsSosLoading] = useState(false);
  const [sosResult, setSosResult] = useState<any | null>(null);

  // Location tracking state
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    accuracy: number;
    recordedAt: string;
  } | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  useEffect(() => {
    fetchInitialLocation();
  }, []);

  const fetchInitialLocation = async () => {
    try {
      const res = await fetch("/api/location");
      const json = await res.json();
      if (json.success && json.data) {
        setIsOptedIn(json.data.optInLocation);
        if (json.data.latestPing) {
          setLocationData(json.data.latestPing);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleTriggerSos = async () => {
    setIsSosLoading(true);
    setSosResult(null);

    let lat = locationData?.latitude || 26.9124;
    let lon = locationData?.longitude || 75.7873;

    try {
      const res = await fetch("/api/safety/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          batteryLevel: 85,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSosResult(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSosLoading(false);
    }
  };

  const handleToggleLocationTracking = async () => {
    setIsLocationLoading(true);
    const newConsent = !isOptedIn;

    try {
      if (newConsent && "geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const payload = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              optInLocation: true,
            };

            await updateLocationOnServer(payload);
          },
          async () => {
            // Fallback default coordinates if browser location denied
            await updateLocationOnServer({
              latitude: 26.9124,
              longitude: 75.7873,
              accuracy: 20,
              optInLocation: true,
            });
          }
        );
      } else {
        await updateLocationOnServer({
          latitude: 26.9124,
          longitude: 75.7873,
          accuracy: 20,
          optInLocation: false,
        });
      }
    } catch (e) {
      console.error(e);
      setIsLocationLoading(false);
    }
  };

  const updateLocationOnServer = async (data: any) => {
    try {
      const res = await fetch("/api/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (res.ok) {
        setIsOptedIn(data.optInLocation);
        setLocationData({
          latitude: data.latitude,
          longitude: data.longitude,
          accuracy: data.accuracy,
          recordedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLocationLoading(false);
    }
  };

  const emergencyContactsList = [
    { name: "National Emergency (Police, Fire, Ambulance)", number: "112", desc: "All-in-one 24/7 central responder across India", tel: "112" },
    { name: "Ministry of Tourism Helpline", number: "1363", desc: "Multi-language foreign & domestic tourist assistance", tel: "1363" },
    { name: "National Women Helpline", number: "1091", desc: "Dedicated emergency line for women travelers", tel: "1091" },
    { name: "Medical Ambulance", number: "102", desc: "Government emergency medical dispatch", tel: "102" },
    { name: "RailMadad (Railway Assistance)", number: "139", desc: "Train security, medical onboard & coach assistance", tel: "139" },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 text-xs font-semibold mb-2">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>India Safety & Response Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-50">
          {t.safety.title}
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
          {t.safety.subtitle}
        </p>
      </div>

      {/* Mandatory DPDP / Safety Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-950 dark:text-amber-100">
            {t.safety.sosDisclaimerTitle}
          </h4>
          <p className="mt-1 leading-relaxed text-amber-800 dark:text-amber-300">
            {t.safety.sosDisclaimerBody}
          </p>
        </div>
      </div>

      {/* Central Emergency SOS Button */}
      <div className="p-8 rounded-3xl bg-linear-to-b from-red-500/10 via-red-500/5 to-transparent border border-red-200 dark:border-red-900/60 text-center space-y-4">
        <div className="relative inline-block">
          <button
            onClick={handleTriggerSos}
            disabled={isSosLoading}
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-red-600 hover:bg-red-700 text-white font-black text-xl sm:text-2xl tracking-wider shadow-2xl shadow-red-600/40 flex flex-col items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {isSosLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Radio className="w-8 h-8 mb-1 animate-pulse" />
                <span>{t.safety.triggerSos}</span>
              </>
            )}
          </button>
        </div>

        <div>
          <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
            One-Touch Emergency Dispatch
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-md mx-auto mt-1">
            Transmits high-priority coordinates to trusted companions and logs GPS trail on secure server.
          </p>
        </div>
      </div>

      {/* SOS Result Banner */}
      {sosResult && (
        <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-bold text-sm text-teal-900 dark:text-teal-100">
                {t.safety.sosTriggered} • Alert ID: {sosResult.alertId}
              </h4>
              <p className="text-xs text-teal-800 dark:text-teal-300">
                {t.safety.sosBroadcastNote}
              </p>

              <div className="space-y-1.5 pt-2 border-t border-teal-200/60 dark:border-teal-800">
                {sosResult.notifiedContacts?.map((c: any, idx: number) => (
                  <div key={idx} className="text-[11px] text-teal-900 dark:text-teal-200 font-medium">
                    ✓ Simulated SMS delivered to <span className="font-bold">{c.name}</span> ({c.phone})
                  </div>
                ))}
              </div>

              <div className="pt-2 text-xs">
                <a
                  href={sosResult.location?.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-teal-700 dark:text-teal-300 underline inline-flex items-center gap-1"
                >
                  <span>View Coordinates on Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1-Touch National Emergency Dialers */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 mb-4 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-orange-600" />
          Indian National Emergency Helplines (Direct Click-to-Dial)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {emergencyContactsList.map((contact, idx) => (
            <a
              key={idx}
              href={`tel:${contact.tel}`}
              className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-zinc-800/60 hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-zinc-800 transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-xs font-bold text-stone-900 dark:text-stone-100 block">
                  {contact.name}
                </span>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 block">
                  {contact.desc}
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-orange-600 group-hover:bg-orange-700 text-white font-extrabold text-sm shrink-0 flex items-center gap-1.5 shadow-xs">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{contact.number}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* DPDP Opt-In Location Tracking */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-stone-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-orange-600" />
              {t.location.title}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
              {t.location.optInConsentBody}
            </p>
          </div>

          <button
            onClick={handleToggleLocationTracking}
            disabled={isLocationLoading}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
              isOptedIn
                ? "bg-stone-200 dark:bg-zinc-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300"
                : "bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
            }`}
          >
            {isLocationLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : isOptedIn ? (
              t.location.stopTracking
            ) : (
              t.location.allowTracking
            )}
          </button>
        </div>

        {/* Location Status details */}
        <div className="p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200/80 dark:border-stone-700/80 text-xs">
          <div className="flex items-center gap-2 mb-2 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                isOptedIn ? "bg-teal-500 animate-ping" : "bg-stone-400"
              }`}
            />
            <span className="text-stone-800 dark:text-stone-200 font-bold">
              Status: {isOptedIn ? t.location.statusActive : t.location.statusDisabled}
            </span>
          </div>

          {locationData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-stone-600 dark:text-stone-400 text-[11px] mt-2">
              <div>
                <span className="block text-stone-400">Coordinates:</span>
                <span className="font-mono text-stone-900 dark:text-stone-200 font-semibold">
                  {locationData.latitude.toFixed(4)}°N, {locationData.longitude.toFixed(4)}°E
                </span>
              </div>
              <div>
                <span className="block text-stone-400">Accuracy:</span>
                <span className="text-stone-900 dark:text-stone-200 font-semibold">
                  ~{locationData.accuracy} meters
                </span>
              </div>
              <div>
                <span className="block text-stone-400">Last Ping:</span>
                <span className="text-stone-900 dark:text-stone-200 font-semibold">
                  {formatIndianDate(locationData.recordedAt)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

