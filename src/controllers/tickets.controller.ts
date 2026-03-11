import type { Request, Response } from "express";
import * as ticketsService from "../services/tickets.service.js";

export async function getMyTickets(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const tickets = await ticketsService.getMyTickets(user.id);
  res.json({ tickets });
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  const { eventId, items } = req.body;
  const userId = req.user?.id;

  const tickets = await ticketsService.createOrder({
    eventId,
    userId,
    items: items.map((i: { tier: string; price: number; quantity: number }) => ({
      tier: i.tier,
      price: Math.round(i.price * 100), // dollars to cents
      quantity: i.quantity,
    })),
  });

  res.status(201).json({
    orderId: tickets[0]?.id ?? "order",
    tickets: tickets.map((t) => ({
      id: t.id,
      eventId: t.eventId,
      tier: t.tier,
      quantity: t.quantity,
    })),
  });
}
