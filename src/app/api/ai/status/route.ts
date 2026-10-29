import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET(req: NextRequest) {
  const headerKey = req.headers.get("x-gemini-key");
  const apiKey = (headerKey && headerKey.trim() !== "") ? headerKey.trim() : process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({
      connected: false,
      configured: false,
      message: "GEMINI_API_KEY is not configured in environment variables or client settings.",
      model: null,
      latencyMs: null,
    });
  }

  const candidateModels = ["gemini-3.5-flash", "gemini-flash-lite-latest", "gemini-3-flash-preview"];
  const genAI = new GoogleGenerativeAI(apiKey);
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const startTime = Date.now();
      const model = genAI.getGenerativeModel({ model: modelName });
      const res = await model.generateContent("Respond with OK");
      const latencyMs = Date.now() - startTime;
      const text = res.response.text().trim();

      return NextResponse.json({
        connected: true,
        configured: true,
        model: modelName,
        latencyMs,
        response: text,
        keyMasked: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
        message: `Gemini API is connected and operating normally with ${modelName}.`,
      });
    } catch (err: any) {
      lastError = err;
    }
  }

  return NextResponse.json({
    connected: false,
    configured: true,
    keyMasked: `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`,
    error: lastError?.message || "Failed to reach Gemini API",
    status: lastError?.status || 500,
    message: "Gemini API key is set, but the Google endpoint returned an error or high demand.",
  });
}
