import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { createBookingSchema } from "@/server/schemas/booking";
import { getOrCreateCurrentUser } from "@/server/services/userService";
import { MOCK_CATALOG } from "@/server/services/mockBookings";
import {
  searchBookingsWithGemini,
  generateBookingVoucher,
} from "@/server/services/bookingAiService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "ALL";
    const query = searchParams.get("q")?.trim();
    const useAi = searchParams.get("ai");
    const customApiKey = req.headers.get("x-gemini-key");

    // If search query is provided and AI search is requested (or default when searching)
    if (query && useAi !== "false") {
      const { items, source } = await searchBookingsWithGemini(
        {
          query,
          category: category as any,
        },
        customApiKey
      );

      return NextResponse.json({
        success: true,
        data: items,
        source,
        message:
          source === "gemini"
            ? "Generated live verified Indian booking options with Gemini AI"
            : "Loaded matching results from Indian travel catalog",
      });
    }

    // Standard catalog retrieval
    let items = MOCK_CATALOG;
    if (category && category !== "ALL") {
      items = items.filter((item) => item.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.destination.toLowerCase().includes(q) ||
          item.provider.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      data: items,
      source: "catalog",
    });
  } catch (err: any) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookings catalog", message: err.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateCurrentUser();
    const body = await req.json();

    const parseResult = createBookingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    const customApiKey = req.headers.get("x-gemini-key");

    // 1. Generate digital e-Ticket / Boarding Voucher using Gemini AI
    const voucher = await generateBookingVoucher(
      {
        category: data.category,
        title: data.title,
        provider: data.provider,
        price: data.price,
      },
      data.passenger || { name: user.name || "Traveler" },
      customApiKey
    );

    // Merge custom details with the AI generated voucher
    const combinedDetails = {
      ...data.details,
      ...voucher,
    };

    // 2. Persist booking to SQLite
    const booking = await db.booking.create({
      data: {
        userId: user.id,
        tripId: data.tripId || null,
        category: data.category,
        title: data.title,
        provider: data.provider,
        price: data.price,
        isEstimated: true,
        bookingDate: new Date(data.bookingDate),
        status: "CONFIRMED_MOCK",
        detailsJson: JSON.stringify(combinedDetails),
      },
    });

    // 3. If connected to a Trip and attachExpense is enabled, log expense to auto-update budget
    if (data.tripId && data.attachExpense !== false) {
      const expenseCategory =
        data.category === "EXPERIENCE"
          ? "ACTIVITIES"
          : data.category === "STAY"
          ? "STAY"
          : "TRAVEL";

      await db.expense.create({
        data: {
          tripId: data.tripId,
          userId: user.id,
          title: `Reservation: ${data.title} (${data.provider})`,
          amount: data.price,
          category: expenseCategory,
          paidBy: data.passenger?.name || "You",
          splitType: "EQUAL",
          splitDetails: JSON.stringify([
            { name: data.passenger?.name || "You", amount: data.price },
          ]),
          expenseDate: new Date(data.bookingDate),
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
        voucher,
        message: "Reservation confirmed! Digital e-voucher generated with Gemini AI.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("POST /api/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to create booking", message: err.message },
      { status: 500 }
    );
  }
}
