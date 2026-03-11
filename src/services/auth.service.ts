import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { prisma } from "../db/prisma.js";
import { config } from "../config/index.js";
import type { AuthUser } from "../types/index.js";

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"] }
  );
}

export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, config.jwt.secret) as AuthUser;
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
  role: "explorer" | "business" | "admin" = "explorer"
) {
  const hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      password: hash,
      name: name?.trim() || null,
      role,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });
  return user;
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const valid = await verifyPassword(password, user.password);
  if (!valid) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role ?? "explorer",
  };
}

export async function createPasswordResetToken(email: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordReset.create({
    data: {
      email: email.toLowerCase().trim(),
      token,
      expiresAt,
    },
  });

  return token;
}

export async function consumePasswordResetToken(
  token: string
): Promise<{ email: string } | null> {
  const reset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    return null;
  }

  await prisma.passwordReset.update({
    where: { id: reset.id },
    data: { used: true },
  });

  return { email: reset.email };
}

export async function updateUserPassword(
  email: string,
  newPassword: string
): Promise<boolean> {
  const hash = await hashPassword(newPassword);
  const result = await prisma.user.updateMany({
    where: { email: email.toLowerCase().trim() },
    data: { password: hash },
  });
  return result.count > 0;
}
