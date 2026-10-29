import { db } from "../db";

export const DEFAULT_USER_ID = "usr_yatrasathi_demo";

/**
 * Get or create default session user
 */
export async function getOrCreateCurrentUser() {
  let user = await db.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });

  if (!user) {
    user = await db.user.create({
      data: {
        id: DEFAULT_USER_ID,
        name: "Aarav Sharma",
        phone: "+91 98765 43210",
        email: "aarav.sharma@example.in",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        optInLocation: false,
        preferredLang: "en",
      },
    });

    // Seed initial trip and demo expenses so the app is immediately alive and populated
    const demoTrip = await db.trip.create({
      data: {
        userId: user.id,
        title: "Golden Triangle Discovery: Jaipur & Beyond",
        destination: "Jaipur, Rajasthan",
        state: "Rajasthan",
        startDate: new Date("2026-11-10T00:00:00Z"),
        endDate: new Date("2026-11-14T00:00:00Z"),
        totalBudget: 35000,
        currency: "INR",
        status: "ACTIVE",
        coverImage: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
      },
    });

    // Seed realistic Indian expenses
    await db.expense.createMany({
      data: [
        {
          tripId: demoTrip.id,
          userId: user.id,
          title: "Vande Bharat Executive Tickets (2 Pax)",
          amount: 3700,
          category: "TRAVEL",
          paidBy: "You",
          splitType: "EQUAL",
          splitDetails: JSON.stringify([
            { name: "You", amount: 1850 },
            { name: "Rohan", amount: 1850 },
          ]),
          expenseDate: new Date("2026-11-10T09:30:00Z"),
        },
        {
          tripId: demoTrip.id,
          userId: user.id,
          title: "Haveli Heritage Stay (2 nights)",
          amount: 7200,
          category: "STAY",
          paidBy: "You",
          splitType: "EQUAL",
          splitDetails: JSON.stringify([
            { name: "You", amount: 3600 },
            { name: "Rohan", amount: 3600 },
          ]),
          expenseDate: new Date("2026-11-10T14:00:00Z"),
        },
        {
          tripId: demoTrip.id,
          userId: user.id,
          title: "Chokhi Dhani Royal Thali & Cultural Show",
          amount: 1900,
          category: "FOOD",
          paidBy: "Rohan",
          splitType: "EQUAL",
          splitDetails: JSON.stringify([
            { name: "You", amount: 950 },
            { name: "Rohan", amount: 950 },
          ]),
          expenseDate: new Date("2026-11-10T20:30:00Z"),
        },
        {
          tripId: demoTrip.id,
          userId: user.id,
          title: "Amer Fort Guided Audio Tour & Electric Jeep",
          amount: 850,
          category: "ACTIVITIES",
          paidBy: "You",
          splitType: "EQUAL",
          splitDetails: JSON.stringify([
            { name: "You", amount: 425 },
            { name: "Rohan", amount: 425 },
          ]),
          expenseDate: new Date("2026-11-11T10:15:00Z"),
        },
        {
          tripId: demoTrip.id,
          userId: user.id,
          title: "Johari Bazar Sanganeri Blue Pottery",
          amount: 2200,
          category: "SHOPPING",
          paidBy: "You",
          splitType: "EXACT",
          splitDetails: JSON.stringify([{ name: "You", amount: 2200 }]),
          expenseDate: new Date("2026-11-11T17:00:00Z"),
        },
      ],
    });

    // Seed mock booking
    await db.booking.create({
      data: {
        tripId: demoTrip.id,
        userId: user.id,
        category: "TRAVEL",
        title: "Vande Bharat Express (Executive Chair Car)",
        provider: "IRCTC Indian Railways",
        price: 3700,
        isEstimated: true,
        bookingDate: new Date("2026-11-10T06:00:00Z"),
        status: "CONFIRMED_MOCK",
        detailsJson: JSON.stringify({
          trainNo: "20977",
          seatClass: "EC",
          coach: "E1",
          seatNumbers: ["12", "14"],
        }),
      },
    });

    // Seed emergency contacts
    await db.safetyContact.createMany({
      data: [
        {
          userId: user.id,
          name: "Papa (Rajesh Sharma)",
          phone: "9811122334",
          relationship: "Father",
          isPrimary: true,
        },
        {
          userId: user.id,
          name: "Rohan Verma",
          phone: "9876598765",
          relationship: "Travel Companion",
          isPrimary: false,
        },
      ],
    });
  }

  return user;
}

/**
 * DPDP Act 2023 Compliance: Wipe all user data
 */
export async function deleteUserAllData(userId: string) {
  // Delete all cascades: location pings, expenses, bookings, trips, safety contacts
  await db.locationPing.deleteMany({ where: { userId } });
  await db.expense.deleteMany({ where: { userId } });
  await db.booking.deleteMany({ where: { userId } });
  await db.trip.deleteMany({ where: { userId } });
  await db.safetyContact.deleteMany({ where: { userId } });

  // Reset user privacy flags
  await db.user.update({
    where: { id: userId },
    data: {
      optInLocation: false,
      name: "Guest Yatri",
      phone: null,
      email: null,
    },
  });

  return { success: true, message: "All user data securely expunged per DPDP Act 2023 regulations." };
}
