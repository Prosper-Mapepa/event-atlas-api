import { prisma } from "../db/prisma.js";

export async function updateUser(
  userId: string,
  data: { name?: string; email?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name != null && { name: data.name.trim() || null }),
      ...(data.email != null && { email: data.email.toLowerCase().trim() }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
}
