import { Router } from "express";
import { z } from "zod";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import * as eventsController from "../controllers/events.controller.js";

const router = Router();

const createEventSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  location: z.string().min(1),
  lat: z.number(),
  lng: z.number(),
  startAt: z.string(),
  endAt: z.string().optional(),
  capacity: z.number().optional(),
  highlight: z.string().optional(),
  description: z.string().optional(),
  priceFrom: z.number().optional(),
  priceTo: z.number().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  imageUrls: z.array(z.string().url()).optional(),
  tiers: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
  })).optional(),
});

const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
  capacity: z.number().optional(),
  highlight: z.string().optional(),
  description: z.string().optional(),
  priceFrom: z.number().optional(),
  priceTo: z.number().optional(),
  imageUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  imageUrls: z.array(z.string().url()).optional(),
  tiers: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.number(),
  })).optional(),
  status: z.enum(["draft", "pending_approval", "approved", "rejected"]).optional(),
});

router.get("/nearby", eventsController.getNearby);
router.get("/pending", eventsController.getPending);
router.get("/:id", eventsController.getById);
router.post("/", authMiddleware, validateBody(createEventSchema), eventsController.create);
router.patch("/:id", authMiddleware, validateBody(updateEventSchema), eventsController.update);

export const eventsRoutes = router;
