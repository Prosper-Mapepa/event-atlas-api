import type { Request, Response } from "express";
import * as messagingService from "../services/messaging.service.js";
import { prisma } from "../db/prisma.js";
import { emitToUser } from "../socket.js";

export async function getAdmins(_req: Request, res: Response) {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true, name: true, email: true },
    });
    res.json({ admins });
  } catch {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
}

export async function getOrCreateConversation(req: Request, res: Response) {
  const user = req.user!;
  const otherUserId = req.body?.otherUserId as string | undefined;
  if (!otherUserId || typeof otherUserId !== "string") {
    res.status(400).json({ error: "otherUserId required" });
    return;
  }
  try {
    const conv = await messagingService.getOrCreateConversation(user.id, otherUserId);
    if (!conv) {
      res.status(403).json({ error: "Not allowed to message this user" });
      return;
    }
    const other = conv.user1Id === user.id ? conv.user2 : conv.user1;
    res.json({
      conversation: {
        id: conv.id,
        otherUser: other,
        updatedAt: conv.updatedAt,
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to get or create conversation" });
  }
}

export async function getConversations(req: Request, res: Response) {
  const user = req.user!;
  try {
    const { conversations, totalUnread } = await messagingService.getConversations(user.id);
    res.json({ conversations, totalUnread });
  } catch {
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  const user = req.user!;
  try {
    const totalUnread = await messagingService.getUnreadCount(user.id);
    res.json({ totalUnread });
  } catch {
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
}

export async function getConversation(req: Request, res: Response) {
  const user = req.user!;
  const { id } = req.params;
  try {
    const conv = await messagingService.getConversationById(id, user.id);
    if (!conv) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ conversation: conv });
  } catch {
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
}

export async function getMessages(req: Request, res: Response) {
  const user = req.user!;
  const { id } = req.params;
  const limit = Math.min(Number(req.query.limit) || 80, 200);
  try {
    const messages = await messagingService.getMessages(id, user.id, limit);
    if (!messages) {
      res.status(404).json({ error: "Conversation not found" });
      return;
    }
    res.json({ messages });
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

export async function postMessage(req: Request, res: Response) {
  const user = req.user!;
  const { id } = req.params;
  const content = (req.body?.content as string) ?? "";
  try {
    const result = await messagingService.sendMessage(id, user.id, content);
    if (!result) {
      res.status(400).json({ error: "Conversation not found or invalid message" });
      return;
    }
    const serialized = {
      ...result.message,
      createdAt: result.message.createdAt.toISOString(),
    };
    emitToUser(result.recipientId, "message", serialized);
    res.status(201).json({ message: result.message });
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
}
