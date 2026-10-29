import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { createExpenseSchema } from "@/server/schemas/expense";
import { getOrCreateCurrentUser } from "@/server/services/userService";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const expenses = await db.expense.findMany({
      where: { tripId: id },
      orderBy: { expenseDate: "desc" },
    });
    return NextResponse.json({ success: true, data: expenses });
  } catch (err: any) {
    console.error("GET /api/trips/[id]/expenses error:", err);
    return NextResponse.json({ error: "Failed to fetch expenses", message: err.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const user = await getOrCreateCurrentUser();
    const body = await req.json();

    const parseResult = createExpenseSchema.safeParse({ ...body, tripId: id });
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    const expense = await db.expense.create({
      data: {
        tripId: id,
        userId: user.id,
        title: data.title,
        amount: data.amount,
        category: data.category,
        paidBy: data.paidBy,
        splitType: data.splitType,
        splitDetails: data.splitMembers ? JSON.stringify(data.splitMembers) : null,
        expenseDate: data.expenseDate ? new Date(data.expenseDate) : new Date(),
      },
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/trips/[id]/expenses error:", err);
    return NextResponse.json({ error: "Failed to create expense", message: err.message }, { status: 500 });
  }
}
