import { NextRequest, NextResponse } from "next/server";
import { plannerInputSchema } from "@/server/schemas/planner";
import { generateItinerary } from "@/server/services/plannerService";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = plannerInputSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid planner input",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const customApiKey = req.headers.get("x-gemini-key");
    const { plan, source } = await generateItinerary(parseResult.data, customApiKey);

    return NextResponse.json({
      success: true,
      data: plan,
      source,
      message: source === "gemini" ? "Generated using Google Gemini API" : "Generated using deterministic India itinerary brain",
    });
  } catch (err: any) {
    console.error("API /api/planner error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate itinerary",
        message: err?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
