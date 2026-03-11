import { prisma } from "../db/prisma.js";

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Allowed pairs: explorer↔business, business↔admin, admin↔any */
function canMessage(myRole: string, otherRole: string): boolean {
  const roles = { explorer: 1, business: 2, admin: 3 };
  const m = roles[myRole as keyof typeof roles] ?? 0;
  const o = roles[otherRole as keyof typeof roles] ?? 0;
  if (m === 0 || o === 0) return false;
  // explorer can only message business; business only admin; admin anyone (business or explorer)
  if (myRole === "explorer") return otherRole === "business";
  if (myRole === "business") return otherRole === "admin";
  if (myRole === "admin") return otherRole === "business" || otherRole === "explorer";
  return false;
}

export async function getOrCreateConversation(myId: string, otherUserId: string) {
  const [me, other] = await Promise.all([
    prisma.user.findUnique({ where: { id: myId }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: otherUserId }, select: { role: true } }),
  ]);
  if (!me || !other) return null;
  if (!canMessage(me.role, other.role)) return null;

  const [u1, u2] = orderedPair(myId, otherUserId);
  const conv = await prisma.conversation.upsert({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    create: { user1Id: u1, user2Id: u2 },
    update: {},
    include: {
      user1: { select: { id: true, name: true, email: true, role: true } },
      user2: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  return conv;
}

export async function getConversations(userId: string) {
  const list = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      user1: { select: { id: true, name: true, email: true, role: true } },
      user2: { select: { id: true, name: true, email: true, role: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { id: true, content: true, senderId: true, createdAt: true },
      },
    },
  });

  const epoch = new Date(0);
  let totalUnread = 0;

  const results = await Promise.all(
    list.map(async (c) => {
      const other = c.user1Id === userId ? c.user2 : c.user1;
      const lastMessage = c.messages[0] ?? null;
      const myLastReadAt = c.user1Id === userId ? c.user1LastReadAt : c.user2LastReadAt;
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: c.id,
          senderId: { not: userId },
          createdAt: { gt: myLastReadAt ?? epoch },
        },
      });
      totalUnread += unreadCount;
      return {
        id: c.id,
        otherUser: other,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt,
            }
          : null,
        updatedAt: c.updatedAt,
        unreadCount,
      };
    })
  );

  return { conversations: results, totalUnread };
}

export async function getUnreadCount(userId: string) {
  const convos = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    select: { id: true, user1Id: true, user2Id: true, user1LastReadAt: true, user2LastReadAt: true },
  });
  const epoch = new Date(0);
  let total = 0;
  for (const c of convos) {
    const myLastReadAt = c.user1Id === userId ? c.user1LastReadAt : c.user2LastReadAt;
    total += await prisma.message.count({
      where: {
        conversationId: c.id,
        senderId: { not: userId },
        createdAt: { gt: myLastReadAt ?? epoch },
      },
    });
  }
  return total;
}

export async function getConversationById(conversationId: string, userId: string) {
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      user1: { select: { id: true, name: true, email: true, role: true } },
      user2: { select: { id: true, name: true, email: true, role: true } },
    },
  });
  if (!c || (c.user1Id !== userId && c.user2Id !== userId)) return null;
  const other = c.user1Id === userId ? c.user2 : c.user1;
  return { id: c.id, otherUser: other, updatedAt: c.updatedAt };
}

export async function getMessages(conversationId: string, userId: string, limit = 80) {
  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, user1Id: true, user2Id: true },
  });
  if (!c || (c.user1Id !== userId && c.user2Id !== userId)) return null;

  await prisma.conversation.update({
    where: { id: conversationId },
    data:
      c.user1Id === userId
        ? { user1LastReadAt: new Date() }
        : { user2LastReadAt: new Date() },
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: limit,
    include: { sender: { select: { id: true, name: true, email: true } } },
  });
  return messages;
}

export async function sendMessage(conversationId: string, senderId: string, content: string) {
  const trimmed = content.trim();
  if (!trimmed) return null;

  const c = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, user1Id: true, user2Id: true },
  });
  if (!c || (c.user1Id !== senderId && c.user2Id !== senderId)) return null;

  const [msg] = await prisma.$transaction([
    prisma.message.create({
      data: { conversationId, senderId, content: trimmed },
      include: { sender: { select: { id: true, name: true, email: true } } },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);
  const recipientId = c.user1Id === senderId ? c.user2Id : c.user1Id;
  return { message: msg, recipientId };
}
