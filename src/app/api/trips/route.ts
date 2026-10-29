import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { createTripSchema } from "@/server/schemas/trip";
import { getOrCreateCurrentUser } from "@/server/services/userService";
import { calculateBudgetSummary } from "@/server/services/budgetService";

export async function GET() {
  try {
    const user = await getOrCreateCurrentUser();
    const trips = await db.trip.findMany({
      where: { userId: user.id },
      include: {
        expenses: {
          orderBy: { expenseDate: "desc" },
        },
        bookings: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedTrips = trips.map((trip) => {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const budgetSummary = calculateBudgetSummary(trip.totalBudget, trip.expenses, durationDays);

      return {
        ...trip,
        durationDays,
        budgetSummary,
      };
    });

    return NextResponse.json({ success: true, data: enrichedTrips });
  } catch (err: any) {
    console.error("GET /api/trips error:", err);
    return NextResponse.json({ error: "Failed to fetch trips", message: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateCurrentUser();
    const body = await req.json();

    const parseResult = createTripSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const trip = await db.trip.create({
      data: {
        userId: user.id,
        title: data.title,
        destination: data.destination,
        state: data.state || null,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalBudget: data.totalBudget,
        currency: "INR",
        coverImage: data.coverImage || "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
        itineraryJson: data.itineraryJson || null,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, data: trip }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/trips error:", err);
    return NextResponse.json({ error: "Failed to create trip", message: err.message }, { status: 500 });
  }
}
