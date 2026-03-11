import { Router } from "express";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { uploadImage } from "../middleware/upload.js";
import * as uploadController from "../controllers/upload.controller.js";

const router = Router();

router.post(
  "/events/image",
  authMiddleware,
  requireRole("business", "admin"),
  (req, res, next) => {
    uploadImage.single("file")(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message ?? "Upload failed" });
        return;
      }
      next();
    });
  },
  uploadController.uploadEventImage
);

export const uploadRoutes = router;
