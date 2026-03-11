import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import * as messagingController from "../controllers/messaging.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/admins", messagingController.getAdmins);
router.get("/unread-count", messagingController.getUnreadCount);
router.get("/conversations", messagingController.getConversations);
router.post("/conversations", messagingController.getOrCreateConversation);
router.get("/conversations/:id", messagingController.getConversation);
router.get("/conversations/:id/messages", messagingController.getMessages);
router.post("/conversations/:id/messages", messagingController.postMessage);

export const messagingRoutes = router;
