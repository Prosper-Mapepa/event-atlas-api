import { prisma } from "../db/prisma.js";

// ─── Explorer Dashboard ───────────────────────────────────────────────────────
export async function getExplorerAnalytics(userId: string) {
  const [savedCount, rsvpCount, followingCount, ticketsCount] = await Promise.all([
    prisma.savedEvent.count({ where: { userId } }),
    prisma.rSVP.count({ where: { userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
    prisma.ticket.count({
      where: { userId, status: "active" },
    }),
  ]);

  const upcomingRsvps = await prisma.rSVP.findMany({
    where: {
      userId,
      event: { startAt: { gte: new Date() }, status: "approved" },
    },
    include: { event: true },
    take: 5,
    orderBy: { event: { startAt: "asc" } },
  });

  const savedEvents = await prisma.savedEvent.findMany({
    where: {
      userId,
      event: { status: "approved" },
    },
    include: { event: true },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return {
    stats: { savedEvents: savedCount, rsvps: rsvpCount, following: followingCount, tickets: ticketsCount },
    upcomingRsvps: upcomingRsvps.map((r) => ({ ...r.event, rsvpStatus: r.status })),
    savedEvents: savedEvents.map((s) => s.event),
  };
}

// ─── Business Dashboard ───────────────────────────────────────────────────────
export async function getBusinessAnalytics(userId: string) {
  const myEvents = await prisma.event.findMany({
    where: { hostId: userId },
    orderBy: { createdAt: "desc" },
  });

  const totalEvents = myEvents.length;
  const approvedCount = myEvents.filter((e) => e.status === "approved").length;
  const pendingCount = myEvents.filter((e) => e.status === "pending_approval").length;
  const draftCount = myEvents.filter((e) => e.status === "draft").length;
  const rejectedCount = myEvents.filter((e) => e.status === "rejected").length;
  const totalAttendees = myEvents.reduce((sum, e) => sum + e.attendees, 0);

  const totalTickets = await prisma.ticket.count({
    where: { event: { hostId: userId }, status: "active" },
  });

  const rsvpCount = await prisma.rSVP.count({
    where: { event: { hostId: userId } },
  });

  const followerCount = await prisma.follow.count({
    where: { followingId: userId },
  });

  const recentEvents = myEvents.slice(0, 5);

  return {
    stats: {
      totalEvents,
      approved: approvedCount,
      pending: pendingCount,
      drafts: draftCount,
      rejected: rejectedCount,
      totalAttendees,
      totalTickets,
      rsvps: rsvpCount,
      followers: followerCount,
    },
    recentEvents,
  };
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
export async function getAdminAnalytics() {
  const [
    totalUsers,
    totalEvents,
    pendingEvents,
    totalTickets,
    totalRsvps,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.event.count({ where: { status: "pending_approval" } }),
    prisma.ticket.count({ where: { status: "active" } }),
    prisma.rSVP.count(),
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ["role"],
    _count: { id: true },
  });

  const eventsByStatus = await prisma.event.groupBy({
    by: ["status"],
    _count: { id: true },
  });

  const recentUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  const [pendingList, approvedList] = await Promise.all([
    prisma.event.findMany({
      where: { status: "pending_approval" },
      include: { host: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.event.findMany({
      where: { status: "approved" },
      include: { host: { select: { name: true, email: true } } },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
  ]);

  return {
    stats: {
      totalUsers,
      totalEvents,
      pendingEvents,
      totalTickets,
      totalRsvps,
    },
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, r._count.id])),
    eventsByStatus: Object.fromEntries(eventsByStatus.map((s) => [s.status, s._count.id])),
    recentUsers,
    pendingList,
    approvedList,
  };
}
