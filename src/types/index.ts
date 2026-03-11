import type { User } from "@prisma/client";

export type { User };

export type AuthUser = Pick<User, "id" | "email" | "name" | "role"> & { iat?: number; exp?: number };
