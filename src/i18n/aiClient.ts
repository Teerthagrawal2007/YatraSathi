export function getStoredGeminiKey(): string {
  if (typeof window === "undefined") return "";
  const saved = localStorage.getItem("yatrasathi_gemini_key");
  if (saved && saved.trim()) return saved.trim();
  return process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
}

export function setStoredGeminiKey(key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("yatrasathi_gemini_key", key.trim());
  }
}

export function getAiHeaders(): Record<string, string> {
  const key = getStoredGeminiKey();
  if (key) {
    return { "x-gemini-key": key };
  }
  return {};
}
