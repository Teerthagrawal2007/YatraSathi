import { GoogleGenerativeAI } from "@google/generative-ai";
import { PlannerInput, PlannerOutput, plannerOutputSchema } from "../schemas/planner";

/**
 * Deterministic rich mock planner for Indian destinations
 * Used when GEMINI_API_KEY is not configured or fails
 */
export function generateDeterministicMockPlan(input: PlannerInput): PlannerOutput {
  const destLower = input.destination.toLowerCase();
  const daysCount = Math.max(1, Math.min(input.days, 14));

  // Destination-specific curated highlights
  let themePrefix = "Cultural Heritage & Local Flavors";
  let overview = `An unforgettable ${daysCount}-day journey across ${input.destination}, curated for a ${input.travelStyle} travel style with estimated budget of ₹${input.budget.toLocaleString("en-IN")}.`;
  let bestTime = "October to March (Pleasant weather)";
  let cuisine = ["Regional Thali", "Street Chaat", "Masala Chai", "Local Sweets"];
  let localPolice = "112 / +91-11-2301-1111";
  let hospital = `${input.destination} Civil Hospital & Trauma Centre`;

  if (destLower.includes("jaipur") || destLower.includes("rajasthan")) {
    themePrefix = "Royal Rajputana & Pink City Splendors";
    overview = `Experience the majestic forts, vibrant bazaars, and royal dining of Jaipur over ${daysCount} days.`;
    bestTime = "November to February";
    cuisine = ["Dal Baati Churma", "Pyaaz Kachori", "Ghevar", "Laal Maas", "Ker Sangri"];
    localPolice = "Jaipur Tourist Police: 0141-2601728 / 112";
    hospital = "SMS Hospital, Tonk Road, Jaipur";
  } else if (destLower.includes("kerala") || destLower.includes("kochi") || destLower.includes("alleppey") || destLower.includes("munnar")) {
    themePrefix = "God's Own Country - Palm Canals & Spice Hills";
    overview = `A serene tropical escape spanning misty cardamom hills and tranquil emerald backwaters of Kerala.`;
    bestTime = "September to March";
    cuisine = ["Appam with Stew", "Karimeen Pollichathu", "Kerala Sadya", "Banana Fritters", "Payasam"];
    localPolice = "Kerala Police: 112 / Tourist Police Kochi: 0484-2224055";
    hospital = "Aster Medcity Kochi / Alleppey General Hospital";
  } else if (destLower.includes("manali") || destLower.includes("himachal") || destLower.includes("shimla")) {
    themePrefix = "Himalayan Vistas, Cedar Groves & Mountain Thrills";
    overview = `Breathe crisp Himalayan pine air, cross high mountain passes, and unwind in quaint riverside cafes in Himachal.`;
    bestTime = "October to June (Snow in Dec-Feb)";
    cuisine = ["Siddu with Ghee", "Himachali Dham", "Trout Fish", "Thukpa", "Babru"];
    localPolice = "Manali Police Station: 01902-252322 / 112";
    hospital = "Lady Willingdon Hospital, Old Manali";
  } else if (destLower.includes("varanasi") || destLower.includes("kashi")) {
    themePrefix = "Timeless Kashi - Sacred Ghats & Spiritual Awakening";
    overview = `Immerse in the world's oldest living city with ancient temple chants, mystical Ganga Aarti, and narrow artisanal alleys.`;
    bestTime = "October to March";
    cuisine = ["Banarasi Kachori Sabzi", "Malaiyyo (Winter)", "Banarasi Paan", "Tamatar Chaat", "Lassi"];
    localPolice = "Varanasi Tourist Police: 0542-2508105 / 112";
    hospital = "Sir Sunderlal Hospital, BHU Campus, Varanasi";
  } else if (destLower.includes("goa")) {
    themePrefix = "Sun-Kissed Coast, Portuguese Heritage & Susegad";
    overview = `From golden sandy shores and water sports to quiet whitewashed churches and spice plantations in Goa.`;
    bestTime = "November to April";
    cuisine = ["Goan Fish Curry Rice", "Pork Vindaloo", "Bebinca", "Poee with Chorizo", "Feni Cocktail"];
    localPolice = "Goa Tourist Police: 0832-2428744 / 112";
    hospital = "Goa Medical College (GMC), Bambolim";
  }

  // Generate day-by-day plans
  const days = [];
  const baseDailyCost = Math.round(input.budget / daysCount);

  for (let d = 1; d <= daysCount; d++) {
    const morningCost = Math.round(baseDailyCost * 0.35);
    const afternoonCost = Math.round(baseDailyCost * 0.3);
    const eveningCost = Math.round(baseDailyCost * 0.35);

    days.push({
      day: d,
      theme: d === 1 ? "Arrival, Orientation & Landmark Discovery" : d === daysCount ? "Local Souvenirs, Farewell Sunset & Departure" : `Deep Dive Day ${d}: Exploration & Hidden Gems`,
      dailyEstimatedCostINR: morningCost + afternoonCost + eveningCost,
      activities: [
        {
          time: "Morning (8:30 AM - 12:00 PM)",
          title: d === 1 ? `Arrive in ${input.destination} & Historic Walk` : `Heritage Monument & Scenic Exploration`,
          description: `Check into stay, enjoy a traditional breakfast, and begin walking the central cultural zone with certified local guide.`,
          location: `${input.destination} Central Heritage Zone`,
          estimatedCostINR: morningCost,
          tips: "Carry comfortable walking footwear and wear modest attire when visiting heritage monuments.",
        },
        {
          time: "Afternoon (1:00 PM - 4:30 PM)",
          title: "Artisanal Craft Centers & Authentic Lunch",
          description: `Savor authentic regional thali at an iconic eatery, followed by visiting local block-print or handicraft workshops.`,
          location: `${input.destination} Craft Quarter & Market`,
          estimatedCostINR: afternoonCost,
          tips: "Bargaining is expected in street bazaars; UPI / digital payments are widely accepted across India.",
        },
        {
          time: "Evening (5:00 PM - 8:30 PM)",
          title: "Golden Hour Viewpoint & Cultural Street Food",
          description: `Watch sunset from a panoramic vantage point, followed by exploring vibrant night bazaars and sampling famed street chaat.`,
          location: `${input.destination} Sunset Point & Promenade`,
          estimatedCostINR: eveningCost,
          tips: "Arrive 30 minutes before sunset for prime photography angles.",
        },
      ],
    });
  }

  const totalCost = days.reduce((sum, d) => sum + d.dailyEstimatedCostINR, 0);

  return {
    destination: input.destination,
    overview,
    durationDays: daysCount,
    totalEstimatedCostINR: totalCost,
    currency: "INR",
    bestTimeToVisit: bestTime,
    localCuisine: cuisine,
    days,
    packingTips: [
      "Breathable cotton clothes for daytime; lightweight layer for air-conditioned transit.",
      "Reusable water bottle with built-in filter or UV purifier.",
      "Universal power adapter and high-capacity power bank for long sightseeing days.",
      "Basic first-aid kit with ORS sachets, motion sickness tablets, and mosquito repellent cream.",
      "Slip-on shoes for frequent temple/heritage site visits.",
    ],
    safetyTips: [
      "Always drink bottled or filtered water; avoid ice from roadside juice carts.",
      "Keep digital copies of government ID (Aadhaar/Passport) securely on your phone.",
      "Use prepaid taxi booths or ride-hailing apps (Ola/Uber) rather than unmetered autos at stations.",
      "Save emergency numbers: 112 (National Emergency), 1091 (Women Helpline), 1363 (Tourist Helpline).",
      "YatraSathi Live Tracking: Keep location opt-in enabled so trusted companions know your location.",
    ],
    emergencyInfo: {
      localPolice,
      nearestHospital: hospital,
      nationalHelpline: "112",
      touristHelpline: "1363",
    },
  };
}

/**
 * Generate itinerary via Google Gemini API or fallback
 */
export async function generateItinerary(input: PlannerInput): Promise<{
  plan: PlannerOutput;
  source: "gemini" | "deterministic_mock";
}> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    return {
      plan: generateDeterministicMockPlan(input),
      source: "deterministic_mock",
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = ["gemini-3.5-flash", "gemini-flash-lite-latest", "gemini-3-flash-preview"];
    let lastError: any = null;

    const prompt = `
You are the AI travel brain for YatraSathi, an India-focused travel platform.
Generate a structured, realistic travel itinerary for the following Indian trip request:
- Destination: ${input.destination}
- Duration: ${input.days} days
- Budget: ₹${input.budget} INR total
- Travelers: ${input.travelers} person(s)
- Travel Style: ${input.travelStyle}
- Specific Interests: ${input.interests.join(", ") || "General sightseeing, local food, culture"}

CRITICAL REQUIREMENTS:
1. Every monetary figure must be in Indian Rupees (INR) and realistic for Indian travel.
2. Label all prices as estimated.
3. Include real places, authentic regional food recommendations, real emergency hospitals and tourist police contact for ${input.destination}.
4. Return ONLY a valid JSON object matching this exact schema (no prose outside JSON):
{
  "destination": string,
  "overview": string,
  "durationDays": number,
  "totalEstimatedCostINR": number,
  "currency": "INR",
  "bestTimeToVisit": string,
  "localCuisine": [string],
  "days": [
    {
      "day": number,
      "theme": string,
      "dailyEstimatedCostINR": number,
      "activities": [
        {
          "time": string,
          "title": string,
          "description": string,
          "location": string,
          "estimatedCostINR": number,
          "tips": string
        }
      ]
    }
  ],
  "packingTips": [string],
  "safetyTips": [string],
  "emergencyInfo": {
    "localPolice": string,
    "nearestHospital": string,
    "nationalHelpline": "112",
    "touristHelpline": "1363"
  }
}
`;

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        });

        const result = await model.generateContent(prompt);
        let responseText = result.response.text().trim();

        // Strip markdown backticks if any
        if (responseText.startsWith("```json")) {
          responseText = responseText.replace(/^```json/, "").replace(/```$/, "").trim();
        } else if (responseText.startsWith("```")) {
          responseText = responseText.replace(/^```/, "").replace(/```$/, "").trim();
        }

        const parsedJson = JSON.parse(responseText);
        const validated = plannerOutputSchema.parse(parsedJson);

        return {
          plan: validated,
          source: "gemini",
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${modelName} failed or unavailable: ${err?.message || err}. Trying next model...`);
      }
    }

    throw lastError || new Error("All candidate Gemini models failed.");
  } catch (error) {
    console.warn("Gemini API call failed or timed out. Falling back to deterministic mock planner:", error);
    return {
      plan: generateDeterministicMockPlan(input),
      source: "deterministic_mock",
    };
  }
}
