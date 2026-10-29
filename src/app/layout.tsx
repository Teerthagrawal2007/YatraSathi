import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { I18nProvider } from "@/i18n";

export const metadata: Metadata = {
  title: "YatraSathi (यात्रासाथी) - AI India Travel & Budget Companion",
  description:
    "AI-powered Indian itinerary planner, ₹ INR budget & companion split tracker, verified Indian train & haveli bookings, and emergency SOS center.",
  keywords: [
    "India Travel Planner",
    "YatraSathi",
    "IRCTC Trains",
    "Rajasthan Havelis",
    "Kerala Backwaters",
    "INR Budget Manager",
    "DPDP Act 2023",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors selection:bg-orange-500 selection:text-white">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
