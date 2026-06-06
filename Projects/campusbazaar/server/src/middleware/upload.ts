import multer, { type FileFilterCallback } from "multer";
import path from "node:path";
import fs from "node:fs";
import type { Request } from "express";
import { env } from "../config/env.js";
import { BadRequest } from "../utils/errors.js";

const root = path.resolve(process.cwd(), env.UPLOAD_DIR);
fs.mkdirSync(path.join(root, "listings"), { recursive: true });
fs.mkdirSync(path.join(root, "avatars"), { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(root, "listings"));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.mimetype)) {
    cb(BadRequest("Invalid file type"));
    return;
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});
