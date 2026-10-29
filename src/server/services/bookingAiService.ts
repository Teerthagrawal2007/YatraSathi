import { GoogleGenerativeAI } from "@google/generative-ai";
import { MOCK_CATALOG, CatalogItem } from "./mockBookings";

export interface BookingSearchRequest {
  query: string;
  category?: "TRAVEL" | "STAY" | "EXPERIENCE" | "ALL";
  destination?: string;
  budgetLimit?: number;
}

export interface AiGeneratedBookingOption {
  id: string;
  category: "TRAVEL" | "STAY" | "EXPERIENCE";
  title: string;
  destination: string;
  provider: string;
  price: number;
  isEstimated: boolean;
  rating: number;
  reviewsCount: number;
  image: string;
  badge?: string;
  description: string;
  features: string[];
  routeOrLocation: string;
  durationOrType: string;
}

export interface BookingVoucherDetails {
  bookingRef: string;
  pnrNumber?: string;
  passengerName: string;
  passengerAge?: number;
  assignedSeatOrRoom: string;
  coachOrBuilding?: string;
  boardingOrCheckInTime: string;
  reportingInstructions: string;
  cancellationPolicy: string;
  aiTravelerTip: string;
  qrCodeContent: string;
  mealPreference?: string;
}

const CANDIDATE_MODELS = ["gemini-3.5-flash", "gemini-flash-lite-latest", "gemini-3-flash-preview"];

/**
 * AI-powered Live Booking Search across Trains, Flights, Stays & Activities in India
 */
export async function searchBookingsWithGemini(
  params: BookingSearchRequest,
  customApiKey?: string | null
): Promise<{ items: AiGeneratedBookingOption[]; source: "gemini" | "catalog_fallback" }> {
  const apiKey = (customApiKey && customApiKey.trim() !== "") ? customApiKey.trim() : process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || !params.query.trim()) {
    return {
      items: filterCatalogFallback(params),
      source: "catalog_fallback",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `
You are the AI Booking Engine for YatraSathi, India's travel platform.
The user is searching for Indian travel services (trains, flights, Volvo buses, heritage stays, resorts, or local experiences).

User Search Request: "${params.query}"
Category Filter: "${params.category || "ALL"}"
Destination: "${params.destination || "Anywhere in India"}"
Budget Limit: "${params.budgetLimit ? "₹" + params.budgetLimit : "Flexible"}"

CRITICAL REQUIREMENTS:
1. Generate 3 to 4 realistic Indian booking options tailored to the request.
2. For trains, use REAL Indian Railways train numbers & names (e.g. 20977 Vande Bharat, 12951 Mumbai Rajdhani, 12423 Dibrugarh Rajdhani, 12004 Shatabdi Express, 12259 Sealdah Duronto).
3. For stays, specify authentic Indian accommodation types (Heritage Haveli in Rajasthan, Beach Cottages in Goa, Kettuvallam Houseboats in Alleppey, Homestays in Coorg/Himachal, Zostel).
4. All prices must be realistic estimated rates in Indian Rupees (INR) for 2026.
5. Provide relevant Unsplash image URLs from curated Indian travel photo collections.
6. Return ONLY valid JSON array with no conversational prose:
[
  {
    "id": "ai-book-1",
    "category": "TRAVEL" | "STAY" | "EXPERIENCE",
    "title": string,
    "destination": string,
    "provider": string,
    "price": number,
    "isEstimated": true,
    "rating": number (between 4.2 and 4.9),
    "reviewsCount": number,
    "image": string (valid Unsplash travel image url),
    "badge": string (e.g., "High-Speed Rail", "Heritage Haveli", "Scenic Cruise"),
    "description": string,
    "features": [string, string, string],
    "routeOrLocation": string,
    "durationOrType": string
  }
]
`;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.6,
          },
        });

        const result = await model.generateContent(prompt);
        let text = result.response.text().trim();

        if (text.startsWith("```json")) {
          text = text.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (text.startsWith("```")) {
          text = text.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Add default fallback images if missing
          const sanitized = parsed.map((item, idx) => ({
            ...item,
            id: `ai-gen-${Date.now()}-${idx}`,
            isEstimated: true,
            image: item.image?.startsWith("http")
              ? item.image
              : getDefaultImage(item.category),
          }));

          return {
            items: sanitized,
            source: "gemini",
          };
        }
      } catch (err: any) {
        console.warn(`Gemini search model ${modelName} failed: ${err.message}. Trying next candidate...`);
      }
    }

    return {
      items: filterCatalogFallback(params),
      source: "catalog_fallback",
    };
  } catch (error) {
    console.error("Gemini booking search error:", error);
    return {
      items: filterCatalogFallback(params),
      source: "catalog_fallback",
    };
  }
}

/**
 * AI Generation of full Digital Ticket / Boarding Voucher with Seat/Room allocation
 */
export async function generateBookingVoucher(
  booking: {
    category: string;
    title: string;
    provider: string;
    price: number;
    destination?: string;
  },
  passenger: {
    name: string;
    age?: number;
    gender?: string;
    seatPreference?: string;
    phone?: string;
  },
  customApiKey?: string | null
): Promise<BookingVoucherDetails> {
  const apiKey = (customApiKey && customApiKey.trim() !== "") ? customApiKey.trim() : process.env.GEMINI_API_KEY;
  const isTrain = booking.category === "TRAVEL" && (booking.provider.includes("Rail") || booking.title.toLowerCase().includes("express") || booking.title.toLowerCase().includes("train"));
  const pnr = `PNR-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const bookingRef = `YS-${Math.floor(100000 + Math.random() * 900000)}`;

  if (!apiKey || apiKey.trim() === "") {
    return generateDeterministicVoucher(booking, passenger, bookingRef, pnr, isTrain);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    const prompt = `
You are the Official Confirmation Officer for YatraSathi India Travel & IRCTC integration.
A user has booked the following reservation:
- Category: ${booking.category}
- Service: ${booking.title}
- Provider: ${booking.provider}
- Fare: ₹${booking.price} INR
- Passenger: ${passenger.name}, Age: ${passenger.age || "Adult"}, Gender: ${passenger.gender || "Not specified"}
- Preference: ${passenger.seatPreference || "Standard / Window"}

Generate a complete, official-style Indian ticket voucher details matching this JSON schema:
{
  "bookingRef": "${bookingRef}",
  "pnrNumber": "${isTrain ? pnr : bookingRef}",
  "passengerName": "${passenger.name}",
  "passengerAge": ${passenger.age || 28},
  "assignedSeatOrRoom": string (e.g. "Seat 42 (Window / Lower Berth)" or "Room 204 Heritage Deluxe"),
  "coachOrBuilding": string (e.g. "Coach C2 Executive" or "Courtyard Wing"),
  "boardingOrCheckInTime": string (e.g. "06:15 AM (Departure 06:45 AM)" or "12:00 PM Check-in"),
  "reportingInstructions": string (e.g. "Report at Platform 2, New Delhi Station with valid government photo ID."),
  "cancellationPolicy": string (e.g. "Full refund minus ₹120 clerkage up to 4 hours before departure."),
  "aiTravelerTip": string (one practical insider tip for this exact Indian trip/stay),
  "mealPreference": string (e.g. "Complimentary Veg Morning Breakfast & Masala Chai")
}
`;

    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.5,
          },
        });

        const res = await model.generateContent(prompt);
        let text = res.response.text().trim();
        if (text.startsWith("```json")) {
          text = text.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (text.startsWith("```")) {
          text = text.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsed = JSON.parse(text);
        return {
          ...parsed,
          qrCodeContent: `YATRASATHI_${parsed.bookingRef}_${passenger.name}_INR${booking.price}`,
        };
      } catch (err: any) {
        console.warn(`Voucher generation on ${modelName} failed: ${err.message}`);
      }
    }

    return generateDeterministicVoucher(booking, passenger, bookingRef, pnr, isTrain);
  } catch (e) {
    return generateDeterministicVoucher(booking, passenger, bookingRef, pnr, isTrain);
  }
}

function generateDeterministicVoucher(
  booking: any,
  passenger: any,
  bookingRef: string,
  pnr: string,
  isTrain: boolean
): BookingVoucherDetails {
  return {
    bookingRef,
    pnrNumber: isTrain ? pnr : bookingRef,
    passengerName: passenger.name || "Traveler",
    passengerAge: passenger.age || 26,
    assignedSeatOrRoom: isTrain ? "Seat 28 (Window Side)" : "Deluxe Room #104",
    coachOrBuilding: isTrain ? "Coach C1 Executive" : "Main Heritage Block",
    boardingOrCheckInTime: isTrain ? "07:30 AM (Dep 08:00 AM)" : "Check-in 12:00 PM",
    reportingInstructions: isTrain
      ? "Present digital e-ticket on YatraSathi with Aadhaar or Driving License to TTE upon boarding."
      : "Present reservation confirmation at front desk. Valid photo ID required for all guests.",
    cancellationPolicy: "Free cancellation up to 24 hours prior to travel date with zero penalty fees.",
    aiTravelerTip: "Keep offline digital copies of your Aadhaar card and install RailMadad on your phone for rapid onboard assistance.",
    qrCodeContent: `YATRASATHI_${bookingRef}_${passenger.name || "Traveler"}_CONFIRMED`,
    mealPreference: "Indian Vegetarian Breakfast & Hot Beverage Included",
  };
}

function filterCatalogFallback(params: BookingSearchRequest): AiGeneratedBookingOption[] {
  let list = MOCK_CATALOG;
  if (params.category && params.category !== "ALL") {
    list = list.filter((i) => i.category === params.category);
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    const matched = list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.destination.toLowerCase().includes(q) ||
        i.provider.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q)
    );
    if (matched.length > 0) return matched;
  }
  return list;
}

function getDefaultImage(category: string): string {
  if (category === "TRAVEL") {
    return "https://images.unsplash.com/photo-1596707328006-258055627230?auto=format&fit=crop&w=800&q=80";
  }
  if (category === "STAY") {
    return "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80";
  }
  return "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80";
}

