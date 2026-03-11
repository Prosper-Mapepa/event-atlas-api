import type { Request, Response } from "express";
import {
  createUser,
  authenticateUser,
  signAccessToken,
  createPasswordResetToken,
  consumePasswordResetToken,
  updateUserPassword,
  findUserByEmail,
} from "../services/auth.service.js";

export async function signUp(req: Request, res: Response): Promise<void> {
  const { email, password, name, role } = req.body;
  const validRole = ["explorer", "business", "admin"].includes(role) ? role : "explorer";

  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(409).json({
      error: "Conflict",
      message: "An account with this email already exists",
    });
    return;
  }

  const user = await createUser(email, password, name, validRole);
  const token = signAccessToken(user);

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
    expiresIn: "7d",
  });
}

export async function signIn(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  const user = await authenticateUser(email, password);
  if (!user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid email or password",
    });
    return;
  }

  const token = signAccessToken(user);

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
    expiresIn: "7d",
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Not authenticated",
    });
    return;
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;

  // Always return success to prevent email enumeration
  const token = await createPasswordResetToken(email);

  // In production: send email with reset link
  if (process.env.NODE_ENV === "development") {
    res.json({
      message: "If an account exists, a reset link will be sent",
      // Only include in dev for testing
      _devResetLink: `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`,
    });
  } else {
    res.json({
      message: "If an account exists with this email, a reset link has been sent",
    });
  }
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword } = req.body;

  const payload = await consumePasswordResetToken(token);
  if (!payload) {
    res.status(400).json({
      error: "Bad Request",
      message: "Invalid or expired reset token",
    });
    return;
  }

  const updated = await updateUserPassword(payload.email, newPassword);
  if (!updated) {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to update password",
    });
    return;
  }

  res.json({
    message: "Password has been reset successfully",
  });
}
