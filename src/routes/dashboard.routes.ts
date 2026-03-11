import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import * as dashboardController from "../controllers/dashboard.controller.js";

const router = Router();
router.use(authMiddleware);

router.get("/explorer", dashboardController.getExplorerDashboard);
router.get("/business", dashboardController.getBusinessDashboard);
router.get("/admin", dashboardController.getAdminDashboard);

export const dashboardRoutes = router;
