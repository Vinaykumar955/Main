import { Router } from "express";
import { auth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Listing } from "../models/Listing.js";
import { User } from "../models/User.js";
import { NotFound } from "../utils/errors.js";

const router = Router();

router.get(
  "/stats",
  auth,
  requireRole("admin", "moderator"),
  asyncHandler(async (_req, res) => {
    const [users, listings, sold, active] = await Promise.all([
      User.countDocuments(),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "sold" }),
      Listing.countDocuments({ status: "active" }),
    ]);
    res.json({ users, listings, sold, active });
  }),
);

router.get(
  "/users",
  auth,
  requireRole("admin", "moderator"),
  asyncHandler(async (_req, res) => {
    const items = await User.find().sort({ createdAt: -1 }).limit(100);
    res.json({ items: items.map((u) => u.toJSON()) });
  }),
);

router.patch(
  "/users/:id/suspend",
  auth,
  requireRole("admin"),
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, { role: "user" }, { new: true });
    if (!user) throw NotFound("User not found");
    res.json({ user: user.toJSON() });
  }),
);

router.delete(
  "/listings/:id",
  auth,
  requireRole("admin", "moderator"),
  asyncHandler(async (req, res) => {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { status: "removed" },
      { new: true },
    );
    if (!listing) throw NotFound("Listing not found");
    res.json({ success: true });
  }),
);

export default router;
