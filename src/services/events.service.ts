import { prisma } from "../db/prisma.js";

const DEFAULT_LAT = 37.7749;
const DEFAULT_LNG = -122.4194;
const DEFAULT_RADIUS_KM = 5;
const KM_PER_DEGREE_LAT = 111;
const KM_PER_DEGREE_LNG = 85; // approx at SF latitude

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  const hours = date.getHours();
  const mins = date.getMinutes();
  const t = `${hours > 12 ? hours - 12 : hours}:${mins.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
  if (days < 0) return `Past`;
  if (days === 0) return `Today · ${t}`;
  if (days === 1) return `Tomorrow · ${t}`;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return `${weekdays[date.getDay()]} · ${t}`;
}

function formatPrice(priceFrom: number | null, priceTo: number | null): string {
  if (priceFrom == null || priceFrom === 0) return "Free";
  const from = (priceFrom / 100).toFixed(0);
  if (priceTo == null || priceTo === priceFrom) return `From $${from}`;
  const to = (priceTo / 100).toFixed(0);
  return `$${from} – $${to}`;
}

function formatAttendees(n: number): string {
  if (n < 10) return `${n} attending`;
  if (n < 100) return `${n} spots`;
  return `${n} attending`;
}

export async function getNearbyEvents(params: {
  lat?: number;
  lng?: number;
  radiusKm?: number;
  category?: string;
  limit?: number;
}) {
  const lat = params.lat ?? DEFAULT_LAT;
  const lng = params.lng ?? DEFAULT_LNG;
  const radiusKm = params.radiusKm ?? DEFAULT_RADIUS_KM;
  const limit = params.limit ?? 50;

  const latDelta = radiusKm / KM_PER_DEGREE_LAT;
  const lngDelta = radiusKm / KM_PER_DEGREE_LNG;

  const events = await prisma.event.findMany({
    where: {
      status: "approved",
      lat: { gte: lat - latDelta, lte: lat + latDelta },
      lng: { gte: lng - lngDelta, lte: lng + lngDelta },
      ...(params.category ? { category: { contains: params.category, mode: "insensitive" as const } } : {}),
    },
    orderBy: { startAt: "asc" },
    take: limit,
  });

  return events
    .map((e) => {
      const km = haversineKm(lat, lng, e.lat, e.lng);
      if (km > radiusKm) return null;
      const imageUrls =
        (e.imageUrls as unknown as string[] | null | undefined) ??
        (e.imageUrl ? [e.imageUrl] : null);
      return {
        id: e.id,
        name: e.name,
        category: e.category,
        location: e.location,
        distance: `${km.toFixed(1)} km`,
        time: formatTime(e.startAt),
        attendees: formatAttendees(e.attendees),
        price: formatPrice(e.priceFrom, e.priceTo),
        highlight: e.highlight ?? "Live nearby",
        lat: e.lat,
        lng: e.lng,
        imageUrl: e.imageUrl ?? (imageUrls && imageUrls[0]) ?? null,
        imageUrls: imageUrls ?? null,
      };
    })
    .filter(Boolean);
}

export async function getEventById(id: string) {
  const e = await prisma.event.findUnique({
    where: { id },
    include: { host: { select: { id: true, name: true, role: true } } },
  });
  if (!e) return null;
  const tiers = (e.tiers as Array<{ name: string; description?: string; price: number }>) ?? [
    { name: "General Admission", description: "Standing · access to main floor", price: 3200 },
    { name: "VIP Terrace", description: "Fast entry · dedicated bar · best view", price: 6400 },
  ];
  return {
    ...e,
    time: formatTime(e.startAt),
    price: formatPrice(e.priceFrom, e.priceTo),
    attendees: formatAttendees(e.attendees),
    tiers,
  };
}

export async function createEvent(data: {
  name: string;
  category: string;
  location: string;
  lat: number;
  lng: number;
  startAt: Date;
  endAt?: Date;
  capacity?: number;
  highlight?: string;
  description?: string;
  priceFrom?: number;
  priceTo?: number;
  imageUrl?: string;
  imageUrls?: string[];
  tiers?: Array<{ name: string; description?: string; price: number }>;
  hostId?: string;
  status?: string;
}) {
  return prisma.event.create({
    data: {
      name: data.name,
      category: data.category,
      location: data.location,
      lat: data.lat,
      lng: data.lng,
      startAt: data.startAt,
      endAt: data.endAt,
      capacity: data.capacity,
      highlight: data.highlight,
      description: data.description,
      priceFrom: data.priceFrom,
      priceTo: data.priceTo,
      imageUrl: data.imageUrl ?? (Array.isArray(data.imageUrls) && data.imageUrls[0] ? data.imageUrls[0] : undefined),
      imageUrls: (data.imageUrls ?? []) as object,
      tiers: (data.tiers ?? []) as object,
      hostId: data.hostId,
      status: data.status ?? "pending_approval",
    },
  });
}

export async function updateEvent(
  id: string,
  data: Partial<{
    name: string;
    category: string;
    location: string;
    lat: number;
    lng: number;
    startAt: Date;
    endAt: Date;
    capacity: number;
    highlight: string;
    description: string;
    priceFrom: number;
    priceTo: number;
    imageUrl: string;
    imageUrls: string[];
    tiers: object;
    status: string;
  }>
) {
  return prisma.event.update({
    where: { id },
    data,
  });
}

export async function getPendingEvents() {
  return prisma.event.findMany({
    where: { status: "pending_approval" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEventForUpdate(id: string, userId: string, userRole: string) {
  const e = await prisma.event.findUnique({ where: { id } });
  if (!e) return null;
  if (userRole === "admin") return e;
  if (e.hostId === userId) return e;
  return null;
}
