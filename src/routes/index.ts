import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { eventsRoutes } from "./events.routes.js";
import { ticketsRoutes } from "./tickets.routes.js";
import { usersRoutes } from "./users.routes.js";
import { uploadRoutes } from "./upload.routes.js";
import { engagementRoutes } from "./engagement.routes.js";
import { dashboardRoutes } from "./dashboard.routes.js";
import { messagingRoutes } from "./messaging.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/events", eventsRoutes);
router.use("/tickets", ticketsRoutes);
router.use("/users", usersRoutes);
router.use("/upload", uploadRoutes);
router.use("/engagement", engagementRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/messages", messagingRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export const routes = router;
