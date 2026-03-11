import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import * as engagementController from "../controllers/engagement.controller.js";

const router = Router();
router.use(authMiddleware);

router.post("/saved", engagementController.saveEvent);
router.delete("/saved/:eventId", engagementController.unsaveEvent);
router.get("/saved", engagementController.getSaved);
router.get("/check/:eventId", engagementController.getEventEngagement);

router.post("/rsvp", engagementController.rsvpEvent);
router.delete("/rsvp/:eventId", engagementController.unrsvpEvent);
router.get("/rsvp", engagementController.getRsvps);

router.post("/follow", engagementController.followUser);
router.delete("/follow/:userId", engagementController.unfollowUser);
router.get("/follow", engagementController.getFollowing);
router.get("/follow/check/:userId", engagementController.checkFollow);

export const engagementRoutes = router;
