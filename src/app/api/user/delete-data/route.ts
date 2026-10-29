import { NextResponse } from "next/server";
import { getOrCreateCurrentUser, deleteUserAllData } from "@/server/services/userService";

export async function POST() {
  try {
    const user = await getOrCreateCurrentUser();
    const result = await deleteUserAllData(user.id);
    return NextResponse.json({
      success: true,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("POST /api/user/delete-data error:", err);
    return NextResponse.json({ error: "Failed to erase data", message: err.message }, { status: 500 });
  }
}
