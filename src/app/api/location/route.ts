import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { locationPingSchema, locationConsentSchema } from "@/server/schemas/location";
import { getOrCreateCurrentUser } from "@/server/services/userService";

export async function GET() {
  try {
    const user = await getOrCreateCurrentUser();
    const latestPing = await db.locationPing.findFirst({
      where: { userId: user.id },
      orderBy: { recordedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: {
        optInLocation: user.optInLocation,
        latestPing: latestPing || {
          latitude: 26.9124, // Default to Jaipur / India coordinates if no ping yet
          longitude: 75.7873,
          locality: "Jaipur, Rajasthan",
          accuracy: 15,
          recordedAt: new Date().toISOString(),
        },
      },
    });
  } catch (err: any) {
    console.error("GET /api/location error:", err);
    return NextResponse.json({ error: "Failed to fetch location", message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateCurrentUser();
    if (!user.optInLocation) {
      return NextResponse.json(
        {
          error: "Location tracking requires explicit opt-in consent under DPDP Act 2023.",
          code: "OPT_IN_REQUIRED",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parseResult = locationPingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const ping = await db.locationPing.create({
      data: {
        userId: user.id,
        tripId: data.tripId || null,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy || 10,
        locality: data.locality || "Current Location",
      },
    });

    return NextResponse.json({ success: true, data: ping }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/location error:", err);
    return NextResponse.json({ error: "Failed to record location ping", message: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getOrCreateCurrentUser();
    const body = await req.json();

    const parseResult = locationConsentSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: { optInLocation: parseResult.data.optIn },
    });

    return NextResponse.json({
      success: true,
      optInLocation: updated.optInLocation,
      message: updated.optInLocation
        ? "Location tracking enabled with user consent."
        : "Location tracking paused/revoked. No background GPS will be recorded.",
    });
  } catch (err: any) {
    console.error("PUT /api/location error:", err);
    return NextResponse.json({ error: "Failed to update location consent", message: err.message }, { status: 500 });
  }
}
