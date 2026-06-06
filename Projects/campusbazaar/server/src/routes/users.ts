import { Router } from "express";
import { auth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";
import { Listing } from "../models/Listing.js";
import { NotFound } from "../utils/errors.js";

const router = Router();

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw NotFound("User not found");
    res.json({ user: user.toJSON() });
  }),
);

router.get(
  "/:id/listings",
  asyncHandler(async (req, res) => {
    const items = await Listing.find({ seller: req.params.id, status: { $ne: "removed" } })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("seller", "name username avatar verified hostel room rating");
    res.json({ items });
  }),
);

router.patch(
  "/me",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const updates = req.body as Record<string, unknown>;
    delete updates.password;
    delete updates.role;
    const user = await User.findByIdAndUpdate(req.user!.id, updates, { new: true });
    if (!user) throw NotFound("User not found");
    res.json({ user: user.toJSON() });
  }),
);

export default router;
