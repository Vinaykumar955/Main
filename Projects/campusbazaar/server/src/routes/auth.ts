import { Router } from "express";
import { z } from "zod";
import { User } from "../models/User.js";
import { Listing } from "../models/Listing.js";
import { signToken } from "../utils/token.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth, type AuthedRequest } from "../middleware/auth.js";
import { BadRequest, Unauthorized } from "../utils/errors.js";

const router = Router();

const signUpSchema = z.object({
  name: z.string().min(2).max(60),
  username: z.string().min(3).max(24).regex(/^[a-z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(60),
  hostel: z.string().min(1),
  room: z.string().max(12).optional(),
  yearOfStudy: z.coerce.number().int().min(1).max(7).optional(),
  course: z.string().max(60).optional(),
});

router.post(
  "/sign-up",
  asyncHandler(async (req, res) => {
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid input", parsed.error.flatten());
    const { email, username } = parsed.data;
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing) throw BadRequest("Email or username already in use");
    const user = await User.create({
      ...parsed.data,
      hostel: { name: parsed.data.hostel, block: "Block A" },
      role: "user",
      verified: false,
    });
    const token = signToken({ id: user.id });
    res.status(201).json({ user: user.toJSON(), token, expiresAt: new Date(Date.now() + 7 * 86_400_000) });
  }),
);

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post(
  "/sign-in",
  asyncHandler(async (req, res) => {
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid input");
    const user = await User.findOne({ email: parsed.data.email }).select("+password");
    if (!user) throw Unauthorized("Wrong credentials");
    const ok = await user.comparePassword(parsed.data.password);
    if (!ok) throw Unauthorized("Wrong credentials");
    user.lastSeenAt = new Date();
    await user.save();
    const token = signToken({ id: user.id });
    res.json({ user: user.toJSON(), token, expiresAt: new Date(Date.now() + 7 * 86_400_000) });
  }),
);

router.post(
  "/sign-out",
  auth,
  asyncHandler(async (_req, res) => {
    res.json({ success: true });
  }),
);

router.get(
  "/me",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await User.findById(req.user!.id);
    if (!user) throw Unauthorized("Not found");
    res.json({ user: user.toJSON() });
  }),
);

const otpRequestSchema = z.object({ email: z.string().email() });
router.post(
  "/otp/request",
  asyncHandler(async (req, res) => {
    const parsed = otpRequestSchema.safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid email");
    // Real implementation: queue email/SMS with the code. For dev: return OK.
    res.json({ sent: true });
  }),
);

const otpVerifySchema = otpRequestSchema.extend({ code: z.string().length(6) });
router.post(
  "/otp/verify",
  asyncHandler(async (req, res) => {
    const parsed = otpVerifySchema.safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid code");
    res.json({ verified: true });
  }),
);

export default router;
