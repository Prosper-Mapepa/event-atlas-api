import { Router } from "express";
import { z } from "zod";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/auth.js";
import { validateBody } from "../middleware/validate.js";
import * as ticketsController from "../controllers/tickets.controller.js";

const router = Router();

const createOrderSchema = z.object({
  eventId: z.string().min(1),
  items: z.array(z.object({
    tier: z.string(),
    price: z.number(),
    quantity: z.number().min(1),
  })).min(1),
});

router.get("/", authMiddleware, ticketsController.getMyTickets);
router.post("/", optionalAuthMiddleware, validateBody(createOrderSchema), ticketsController.createOrder);

export const ticketsRoutes = router;
