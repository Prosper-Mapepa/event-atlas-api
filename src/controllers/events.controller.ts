import type { Request, Response } from "express";
import * as eventsService from "../services/events.service.js";

export async function getNearby(req: Request, res: Response): Promise<void> {
  const lat = req.query.lat ? parseFloat(String(req.query.lat)) : undefined;
  const lng = req.query.lng ? parseFloat(String(req.query.lng)) : undefined;
  const radiusKm = req.query.radiusKm ? parseFloat(String(req.query.radiusKm)) : undefined;
  const category = req.query.category ? String(req.query.category) : undefined;
  const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : undefined;

  const events = await eventsService.getNearbyEvents({
    lat,
    lng,
    radiusKm,
    category,
    limit,
  });

  res.json({ events });
}

export async function getPending(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const role = (user as { role?: string }).role ?? "explorer";
  if (role !== "admin") {
    res.status(403).json({ error: "Forbidden", message: "Admin only" });
    return;
  }
  const events = await eventsService.getPendingEvents();
  res.json({ events });
}

export async function getById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const event = await eventsService.getEventById(id);
  if (!event) {
    res.status(404).json({ error: "Not found", message: "Event not found" });
    return;
  }
  res.json(event);
}

export async function create(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const role = (user as { role?: string }).role ?? "explorer";
  if (role !== "business" && role !== "admin") {
    res.status(403).json({
      error: "Forbidden",
      message: "Only business and admin accounts can create events",
    });
    return;
  }

  const {
    name,
    category,
    location,
    lat,
    lng,
    startAt,
    endAt,
    capacity,
    highlight,
    description,
    priceFrom,
    priceTo,
    imageUrl,
    imageUrls,
    tiers,
  } = req.body;

  const status = role === "admin" ? "approved" : "pending_approval";
  const event = await eventsService.createEvent({
    name,
    category,
    location,
    lat,
    lng,
    startAt: new Date(startAt),
    endAt: endAt ? new Date(endAt) : undefined,
    capacity,
    highlight,
    description,
    priceFrom,
    priceTo,
    imageUrl,
    imageUrls,
    tiers,
    hostId: user.id,
    status,
  });

  res.status(201).json(event);
}

export async function update(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const role = (user as { role?: string }).role ?? "explorer";
  const { id } = req.params;

  const canEdit = await eventsService.getEventForUpdate(id, user.id, role);
  if (!canEdit) {
    res.status(404).json({ error: "Not found", message: "Event not found or you cannot edit it" });
    return;
  }

  const body = req.body;
  const updateData: Record<string, unknown> = {};
  if (body.name != null) updateData.name = body.name;
  if (body.category != null) updateData.category = body.category;
  if (body.location != null) updateData.location = body.location;
  if (body.lat != null) updateData.lat = body.lat;
  if (body.lng != null) updateData.lng = body.lng;
  if (body.startAt != null) updateData.startAt = new Date(body.startAt);
  if (body.endAt != null) updateData.endAt = new Date(body.endAt);
  if (body.capacity != null) updateData.capacity = body.capacity;
  if (body.highlight != null) updateData.highlight = body.highlight;
  if (body.description != null) updateData.description = body.description;
  if (body.priceFrom != null) updateData.priceFrom = body.priceFrom;
  if (body.priceTo != null) updateData.priceTo = body.priceTo;
  if (body.imageUrl != null) updateData.imageUrl = body.imageUrl;
  if (body.imageUrls !== undefined) {
    updateData.imageUrls = body.imageUrls;
    // Keep imageUrl in sync with imageUrls so display uses current media
    updateData.imageUrl = Array.isArray(body.imageUrls) && body.imageUrls.length > 0
      ? body.imageUrls[0]
      : null;
  }
  if (body.tiers != null) updateData.tiers = body.tiers;

  if (role === "admin" && body.status != null) {
    if (["draft", "pending_approval", "approved", "rejected"].includes(body.status)) {
      updateData.status = body.status;
    }
  }

  const event = await eventsService.updateEvent(id, updateData as Parameters<typeof eventsService.updateEvent>[1]);
  res.json(event);
}
