import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mockEvents = [
  {
    name: "Neon Nights Rooftop Sessions",
    category: "Music · Nightlife",
    location: "SoMa, San Francisco",
    lat: 37.7799,
    lng: -122.4094,
    startAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    highlight: "Trending near you",
    attendees: 432,
    priceFrom: 3200,
    priceTo: 6400,
    tiers: [
      { name: "General Admission", description: "Standing · access to main floor", price: 3200 },
      { name: "VIP Terrace", description: "Fast entry · dedicated bar · best view", price: 6400 },
    ],
  },
  {
    name: "AI x Product Meetup",
    category: "Technology · Networking",
    location: "Downtown, San Francisco",
    lat: 37.7849,
    lng: -122.4094,
    startAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    highlight: "Filling up fast",
    attendees: 187,
    priceFrom: 0,
    priceTo: 0,
    tiers: [{ name: "Free RSVP", description: "Community meetup", price: 0 }],
  },
  {
    name: "Sunrise Yoga by the Bay",
    category: "Wellness · Community",
    location: "Embarcadero, San Francisco",
    lat: 37.7959,
    lng: -122.3924,
    startAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    highlight: "Locals love this",
    attendees: 92,
    priceFrom: 1800,
    priceTo: 1800,
    tiers: [{ name: "Drop-in", description: "All levels welcome", price: 1800 }],
  },
  {
    name: "Tech Founders Dinner",
    category: "Business · Networking",
    location: "Mission District, San Francisco",
    lat: 37.7599,
    lng: -122.4144,
    startAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    highlight: "Invite only",
    attendees: 45,
    priceFrom: 8500,
    priceTo: 8500,
    tiers: [{ name: "Seated dinner", description: "Exclusive venue", price: 8500 }],
  },
  {
    name: "Live Jazz at the Blue Note",
    category: "Music · Nightlife",
    location: "North Beach, San Francisco",
    lat: 37.7999,
    lng: -122.4084,
    startAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    highlight: "Limited seats",
    attendees: 156,
    priceFrom: 2500,
    priceTo: 2500,
    tiers: [{ name: "General", description: "Table seating", price: 2500 }],
  },
  {
    name: "Design Sprint Workshop",
    category: "Technology · Education",
    location: "SOMA, San Francisco",
    lat: 37.7749,
    lng: -122.4044,
    startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    highlight: "Hands-on",
    attendees: 23,
    priceFrom: 0,
    priceTo: 0,
    tiers: [{ name: "Free", description: "Workshop pass", price: 0 }],
  },
];

async function main() {
  const count = await prisma.event.count();
  if (count > 0) {
    console.log("Events already seeded, skipping");
    return;
  }
  for (const e of mockEvents) {
    await prisma.event.create({
      data: {
        name: e.name,
        category: e.category,
        location: e.location,
        lat: e.lat,
        lng: e.lng,
        startAt: e.startAt,
        highlight: e.highlight,
        attendees: e.attendees,
        priceFrom: e.priceFrom,
        priceTo: e.priceTo,
        tiers: e.tiers as object,
        status: "approved",
      },
    });
  }
  console.log("Seeded", mockEvents.length, "events");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
