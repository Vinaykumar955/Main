import { Router } from "express";
import { auth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/Notification.js";

const router = Router();

router.get(
  "/",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const items = await Notification.find({ user: req.user!.id }).sort({ createdAt: -1 }).limit(50);
    res.json({ items });
  }),
);

router.post(
  "/read-all",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await Notification.updateMany({ user: req.user!.id, read: false }, { read: true, readAt: new Date() });
    res.json({ success: true });
  }),
);

router.post(
  "/:id/read",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    await Notification.updateOne(
      { _id: req.params.id, user: req.user!.id },
      { read: true, readAt: new Date() },
    );
    res.json({ success: true });
  }),
);

export default router;
