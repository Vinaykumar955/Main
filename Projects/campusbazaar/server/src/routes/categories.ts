import { Router } from "express";
import { z } from "zod";
import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const items = await Category.find({ isActive: true }).sort({ order: 1 });
    res.json({ items });
  }),
);

const createSchema = z.object({
  name: z.string().min(2).max(40),
  slug: z.string().min(2).max(40),
  description: z.string().max(280).optional(),
  icon: z.string().default("Package"),
  order: z.number().int().default(0),
});

router.post(
  "/",
  auth,
  requireRole("admin"),
  asyncHandler(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid" });
    const cat = await Category.create(parsed.data);
    res.status(201).json({ category: cat });
  }),
);

export default router;
