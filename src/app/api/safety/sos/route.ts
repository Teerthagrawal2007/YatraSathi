import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { sosTriggerSchema } from "@/server/schemas/safety";
import { getOrCreateCurrentUser } from "@/server/services/userService";

export async function POST(req: NextRequest) {
  try {
    const user = await getOrCreateCurrentUser();
    const body = await req.json().catch(() => ({}));
    const parseResult = sosTriggerSchema.safeParse(body);

    const data = parseResult.success ? parseResult.data : {};
    const contacts = await db.safetyContact.findMany({
      where: { userId: user.id },
    });

    const timestamp = new Date().toISOString();

    return NextResponse.json({
      success: true,
      simulationMode: true,
      disclaimer: "SIMULATED WORKFLOW ONLY: YatraSathi does NOT dispatch physical emergency response. Always call 112 for actual emergencies.",
      alertId: `SOS_${Date.now()}`,
      timestamp,
      user: {
        name: user.name,
        phone: user.phone,
      },
      location: {
        latitude: data.latitude || 26.9124,
        longitude: data.longitude || 75.7873,
        mapsUrl: `https://www.google.com/maps?q=${data.latitude || 26.9124},${data.longitude || 75.7873}`,
      },
      notifiedContacts: contacts.map((c) => ({
        name: c.name,
        phone: c.phone,
        status: "SIMULATED_SMS_SENT",
        message: `EMERGENCY ALERT: ${user.name} triggered SOS via YatraSathi. Location: https://maps.google.com/?q=${data.latitude || 26.9124},${data.longitude || 75.7873}`,
      })),
      emergencyNumbers: [
        { label: "National Emergency Service (All India)", number: "112" },
        { label: "Tourist Police & Assistance", number: "1363" },
        { label: "National Women Helpline", number: "1091" },
        { label: "Medical Ambulance", number: "102" },
        { label: "RailMadad (Train Emergency)", number: "139" },
      ],
    });
  } catch (err: any) {
    console.error("POST /api/safety/sos error:", err);
    return NextResponse.json({ error: "Failed to trigger SOS flow", message: err.message }, { status: 500 });
  }
}
