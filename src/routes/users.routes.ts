import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import * as usersController from "../controllers/users.controller.js";

const router = Router();

const updateMeSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email").optional(),
});

router.get("/me", authMiddleware, usersController.getMe);
router.patch("/me", authMiddleware, validateBody(updateMeSchema), usersController.updateMe);

export const usersRoutes = router;
