import type { Request, Response } from "express";
import * as usersService from "../services/users.service.js";

export async function updateMe(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name, email } = req.body;
  const updated = await usersService.updateUser(user.id, { name, email });
  res.json({ user: updated });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const full = await usersService.getUserById(user.id);
  if (!full) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ user: full });
}
