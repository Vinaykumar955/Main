import { Router } from "express";
import { z } from "zod";
import { auth, type AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Conversation, type ConversationDoc } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { Listing } from "../models/Listing.js";
import { BadRequest, NotFound } from "../utils/errors.js";

const router = Router();

router.get(
  "/conversations",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const convs = await Conversation.find({ participants: req.user!.id })
      .sort({ lastMessageAt: -1 })
      .populate("participants", "name username avatar verified")
      .populate("listing", "title images price");
    res.json({ items: convs });
  }),
);

router.get(
  "/conversations/:id/messages",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const conv = await Conversation.findById(req.params.id);
    if (!conv) throw NotFound("Conversation not found");
    if (!conv.participants.some((p) => p.toString() === req.user!.id)) throw NotFound();
    const messages = await Message.find({ conversationId: conv._id }).sort({ createdAt: 1 });
    res.json({ items: messages });
  }),
);

const sendSchema = z.object({ content: z.string().min(1).max(1000) });

router.post(
  "/conversations/:id/messages",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = sendSchema.safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid message");
    const conv = await Conversation.findById(req.params.id);
    if (!conv) throw NotFound("Conversation not found");
    if (!conv.participants.some((p) => p.toString() === req.user!.id)) throw NotFound();
    const msg = await Message.create({
      conversationId: conv._id,
      sender: req.user!.id,
      content: parsed.data.content,
    });
    conv.lastMessageAt = new Date();
    await conv.save();
    res.status(201).json({ message: msg });
  }),
);

const startSchema = z.object({
  recipientId: z.string().min(1),
  listingId: z.string().min(1).optional(),
  content: z.string().min(1).max(1000),
});

router.post(
  "/conversations",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = startSchema.safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid payload");
    let conv: ConversationDoc | null = await Conversation.findOne({
      participants: { $all: [req.user!.id, parsed.data.recipientId] },
      ...(parsed.data.listingId ? { listing: parsed.data.listingId } : {}),
    });
    if (!conv) {
      conv = await Conversation.create({
        participants: [req.user!.id, parsed.data.recipientId],
        listing: parsed.data.listingId,
      });
    }
    const msg = await Message.create({
      conversationId: conv._id,
      sender: req.user!.id,
      content: parsed.data.content,
    });
    conv.lastMessageAt = new Date();
    await conv.save();
    res.status(201).json({ conversation: conv, message: msg });
  }),
);

export default router;
