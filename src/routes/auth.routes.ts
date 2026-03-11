import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

const signUpSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain a symbol"),
  name: z.string().optional(),
  role: z.enum(["explorer", "business", "admin"]).optional().default("explorer"),
});

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[0-9]/, "Password must contain a number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain a symbol"),
});

router.post("/signup", validateBody(signUpSchema), authController.signUp);
router.post("/signin", validateBody(signInSchema), authController.signIn);
router.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  authController.resetPassword
);
router.get("/me", authMiddleware, authController.me);

export const authRoutes = router;
