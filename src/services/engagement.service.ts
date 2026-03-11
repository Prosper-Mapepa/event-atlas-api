import { prisma } from "../db/prisma.js";

// ─── Saved Events ─────────────────────────────────────────────────────────────
export async function saveEvent(userId: string, eventId: string) {
  return prisma.savedEvent.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId },
    update: {},
  });
}

export async function unsaveEvent(userId: string, eventId: string) {
  return prisma.savedEvent.deleteMany({
    where: { userId, eventId },
  });
}

export async function isEventSaved(userId: string, eventId: string) {
  const saved = await prisma.savedEvent.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
  return !!saved;
}

export async function getSavedEvents(userId: string) {
  return prisma.savedEvent.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          category: true,
          location: true,
          startAt: true,
          imageUrl: true,
          attendees: true,
          priceFrom: true,
          priceTo: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── RSVP ─────────────────────────────────────────────────────────────────────
export async function rsvpEvent(
  userId: string,
  eventId: string,
  status: "going" | "interested" = "going"
) {
  return prisma.rSVP.upsert({
    where: { userId_eventId: { userId, eventId } },
    create: { userId, eventId, status },
    update: { status },
  });
}

export async function unrsvpEvent(userId: string, eventId: string) {
  return prisma.rSVP.deleteMany({
    where: { userId, eventId },
  });
}

export async function getEventRsvp(userId: string, eventId: string) {
  return prisma.rSVP.findUnique({
    where: { userId_eventId: { userId, eventId } },
  });
}

export async function getRsvpEvents(userId: string) {
  return prisma.rSVP.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          category: true,
          location: true,
          startAt: true,
          imageUrl: true,
          attendees: true,
          priceFrom: true,
          priceTo: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Follow ───────────────────────────────────────────────────────────────────
export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error("Cannot follow yourself");
  return prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });
}

export async function unfollowUser(followerId: string, followingId: string) {
  return prisma.follow.deleteMany({
    where: { followerId, followingId },
  });
}

export async function isFollowing(followerId: string, followingId: string) {
  const f = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
  });
  return !!f;
}

export async function getEventEngagement(userId: string, eventId: string) {
  const [saved, rsvp] = await Promise.all([
    isEventSaved(userId, eventId),
    getEventRsvp(userId, eventId),
  ]);
  return { saved, rsvp: rsvp?.status ?? null };
}

export async function getFollowing(userId: string) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });
}
