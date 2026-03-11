import type { Request, Response } from "express";
import * as engagementService from "../services/engagement.service.js";

export async function saveEvent(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { eventId } = req.body;
  if (!eventId || typeof eventId !== "string") {
    res.status(400).json({ error: "eventId required" });
    return;
  }
  await engagementService.saveEvent(user.id, eventId);
  res.json({ saved: true });
}

export async function unsaveEvent(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { eventId } = req.params;
  if (!eventId) {
    res.status(400).json({ error: "eventId required" });
    return;
  }
  await engagementService.unsaveEvent(user.id, eventId);
  res.json({ saved: false });
}

export async function getSaved(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const saved = await engagementService.getSavedEvents(user.id);
  res.json({ saved: saved.map((s) => ({ ...s.event, savedAt: s.createdAt })) });
}

export async function rsvpEvent(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { eventId, status } = req.body;
  if (!eventId || typeof eventId !== "string") {
    res.status(400).json({ error: "eventId required" });
    return;
  }
  const s = (status === "interested" ? "interested" : "going") as "going" | "interested";
  await engagementService.rsvpEvent(user.id, eventId, s);
  res.json({ rsvp: true, status: s });
}

export async function unrsvpEvent(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { eventId } = req.params;
  if (!eventId) {
    res.status(400).json({ error: "eventId required" });
    return;
  }
  await engagementService.unrsvpEvent(user.id, eventId);
  res.json({ rsvp: false });
}

export async function getRsvps(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const rsvps = await engagementService.getRsvpEvents(user.id);
  res.json({
    rsvps: rsvps.map((r) => ({ ...r.event, rsvpStatus: r.status, rsvpAt: r.createdAt })),
  });
}

export async function followUser(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { userId } = req.body;
  if (!userId || typeof userId !== "string") {
    res.status(400).json({ error: "userId required" });
    return;
  }
  try {
    await engagementService.followUser(user.id, userId);
    res.json({ following: true });
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
}

export async function unfollowUser(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  await engagementService.unfollowUser(user.id, userId);
  res.json({ following: false });
}

export async function getEventEngagement(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { eventId } = req.params;
  if (!eventId) {
    res.status(400).json({ error: "eventId required" });
    return;
  }
  const data = await engagementService.getEventEngagement(user.id, eventId);
  res.json(data);
}

export async function getFollowing(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const following = await engagementService.getFollowing(user.id);
  res.json({ following: following.map((f) => f.following) });
}

export async function checkFollow(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: "userId required" });
    return;
  }
  const following = await engagementService.isFollowing(user.id, userId);
  res.json({ following });
}
