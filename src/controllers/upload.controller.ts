import type { Request, Response } from "express";
import { config } from "../config/index.js";

export function uploadEventImage(req: Request, res: Response): void {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  const url = `${config.apiBaseUrl}/uploads/${file.filename}`;
  res.json({ url });
}
