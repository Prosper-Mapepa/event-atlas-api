import { prisma } from "../db/prisma.js";

export async function getMyTickets(userId: string) {
  const tickets = await prisma.ticket.findMany({
    where: { userId, status: "active" },
    include: {
      event: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return tickets.map((t) => ({
    id: t.id,
    eventId: t.eventId,
    eventName: t.event.name,
    eventLocation: t.event.location,
    eventTime: t.event.startAt,
    tier: t.tier,
    price: t.price / 100,
    quantity: t.quantity,
    status: t.status,
  }));
}

export async function createOrder(params: {
  eventId: string;
  userId?: string;
  items: Array<{ tier: string; price: number; quantity: number }>;
}) {
  const tickets = [];
  for (const item of params.items) {
    for (let i = 0; i < item.quantity; i++) {
      const t = await prisma.ticket.create({
        data: {
          eventId: params.eventId,
          userId: params.userId,
          tier: item.tier,
          price: item.price,
          quantity: 1,
        },
      });
      tickets.push(t);
    }
  }
  const event = await prisma.event.findUnique({
    where: { id: params.eventId },
  });
  if (event) {
    const totalQty = params.items.reduce((s, i) => s + i.quantity, 0);
    await prisma.event.update({
      where: { id: params.eventId },
      data: { attendees: { increment: totalQty } },
    });
  }
  return tickets;
}
