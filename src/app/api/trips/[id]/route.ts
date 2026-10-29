import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { updateTripSchema } from "@/server/schemas/trip";
import { calculateBudgetSummary } from "@/server/services/budgetService";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const trip = await db.trip.findUnique({
      where: { id },
      include: {
        expenses: {
          orderBy: { expenseDate: "desc" },
        },
        bookings: {
          orderBy: { bookingDate: "desc" },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const durationDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const budgetSummary = calculateBudgetSummary(trip.totalBudget, trip.expenses, durationDays);

    return NextResponse.json({
      success: true,
      data: {
        ...trip,
        durationDays,
        budgetSummary,
      },
    });
  } catch (err: any) {
    console.error("GET /api/trips/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch trip", message: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const parseResult = updateTripSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.destination) updateData.destination = data.destination;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.totalBudget) updateData.totalBudget = data.totalBudget;
    if (data.status) updateData.status = data.status;
    if (data.itineraryJson !== undefined) updateData.itineraryJson = data.itineraryJson;

    const updated = await db.trip.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("PUT /api/trips/[id] error:", err);
    return NextResponse.json({ error: "Failed to update trip", message: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await db.trip.delete({
      where: { id },
    });
    return NextResponse.json({ success: true, message: "Trip deleted" });
  } catch (err: any) {
    console.error("DELETE /api/trips/[id] error:", err);
    return NextResponse.json({ error: "Failed to delete trip", message: err.message }, { status: 500 });
  }
}
