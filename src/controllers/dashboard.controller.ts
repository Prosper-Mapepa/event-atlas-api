import type { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service.js";

export async function getExplorerDashboard(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const role = (user as { role?: string }).role ?? "explorer";
  if (role !== "explorer") {
    res.status(403).json({ error: "Forbidden", message: "Explorer dashboard only" });
    return;
  }
  const data = await dashboardService.getExplorerAnalytics(user.id);
  res.json(data);
}

export async function getBusinessDashboard(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const role = (user as { role?: string }).role ?? "explorer";
  if (role !== "business") {
    res.status(403).json({ error: "Forbidden", message: "Business dashboard only" });
    return;
  }
  const data = await dashboardService.getBusinessAnalytics(user.id);
  res.json(data);
}

export async function getAdminDashboard(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const role = (user as { role?: string }).role ?? "explorer";
  if (role !== "admin") {
    res.status(403).json({ error: "Forbidden", message: "Admin dashboard only" });
    return;
  }
  const data = await dashboardService.getAdminAnalytics();
  res.json(data);
}
