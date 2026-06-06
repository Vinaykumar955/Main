import { Router } from "express";
import { auth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { upload } from "../middleware/upload.js";
import { env } from "../config/env.js";
import path from "node:path";

const router = Router();

router.post(
  "/images",
  auth,
  upload.array("images", 6),
  asyncHandler(async (req: AuthedRequest, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const urls = files.map((f) => `${baseUrl}/${env.UPLOAD_DIR}/listings/${path.basename(f.path)}`);
    res.json({ urls });
  }),
);

export default router;
