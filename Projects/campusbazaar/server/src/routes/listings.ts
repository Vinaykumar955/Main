import { Router } from "express";
import { z } from "zod";
import { Listing } from "../models/Listing.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { auth, type AuthedRequest, requireRole } from "../middleware/auth.js";
import { BadRequest, Forbidden, NotFound } from "../utils/errors.js";

const router = Router();

const createSchema = z.object({
  title: z.string().min(4).max(100),
  description: z.string().min(20).max(2000),
  price: z.coerce.number().int().min(0),
  negotiable: z.coerce.boolean().default(true),
  urgent: z.coerce.boolean().default(false),
  swapAvailable: z.coerce.boolean().default(false),
  condition: z.enum(["new", "likeNew", "good", "fair", "poor"]),
  category: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    icon: z.string().optional().default("Package"),
  }),
  tags: z.array(z.string().max(20)).max(8).default([]),
  images: z
    .array(z.object({ url: z.string(), alt: z.string().optional(), width: z.number().optional(), height: z.number().optional() }))
    .min(1)
    .max(6),
  hostel: z.object({ name: z.string(), block: z.string().optional().default("") }),
  room: z.string().max(12).optional(),
});

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { q, category, sort, minPrice, maxPrice, condition, hostel, page = 1, limit = 24 } = req.query;
    const filter: Record<string, unknown> = { status: "active" };
    if (typeof q === "string" && q) filter.$text = { $search: q };
    if (typeof category === "string" && category) filter["category.slug"] = category;
    if (typeof hostel === "string" && hostel) filter["hostel.name"] = hostel;
    if (typeof minPrice === "string" || typeof maxPrice === "string") {
      const price: Record<string, number> = {};
      if (typeof minPrice === "string") price.$gte = Number(minPrice);
      if (typeof maxPrice === "string") price.$lte = Number(maxPrice);
      filter.price = price;
    }
    if (typeof condition === "string" && condition) {
      const conds = condition.split(",");
      filter.condition = { $in: conds };
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "price-asc": { price: 1 },
      "price-desc": { price: -1 },
      "most-viewed": { views: -1 },
      "most-saved": { saves: -1 },
    };
    const sortKey = typeof sort === "string" ? sortMap[sort] ?? sortMap.newest : sortMap.newest;

    const pageNum = Math.max(1, Number(page));
    const lim = Math.min(100, Math.max(1, Number(limit)));
    const [items, total] = await Promise.all([
      Listing.find(filter)
        .sort(sortKey)
        .skip((pageNum - 1) * lim)
        .limit(lim)
        .populate("seller", "name username avatar verified hostel room rating")
        .lean(),
      Listing.countDocuments(filter),
    ]);

    res.json({
      items: items.map(serialize),
      total,
      page: pageNum,
      pages: Math.max(1, Math.ceil(total / lim)),
      hasMore: pageNum * lim < total,
    });
  }),
);

router.get(
  "/saved",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    // Demo: a real implementation uses a `Saved` collection
    const items = await Listing.find({ status: "active" }).limit(12).populate("seller", "name username avatar verified hostel room rating");
    res.json({ items: items.map(serialize) });
  }),
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate(
      "seller",
      "name username avatar verified hostel room rating ratingsCount",
    );
    if (!listing) throw NotFound("Listing not found");
    listing.views += 1;
    await listing.save();
    res.json(serialize(listing.toObject()));
  }),
);

router.get(
  "/:id/similar",
  asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw NotFound("Listing not found");
    const items = await Listing.find({
      "category.slug": listing.category.slug,
      _id: { $ne: listing._id },
      status: "active",
    })
      .limit(6)
      .populate("seller", "name username avatar verified hostel room rating");
    res.json({ items: items.map(serialize) });
  }),
);

router.post(
  "/",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid payload", parsed.error.flatten());
    const user = await User.findById(req.user!.id);
    if (!user) throw Forbidden("User missing");
    const listing = await Listing.create({
      ...parsed.data,
      seller: user._id,
      status: "active",
      isFree: parsed.data.price === 0,
    });
    res.status(201).json({ listing: serialize(listing.toObject()) });
  }),
);

router.put(
  "/:id",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw NotFound("Listing not found");
    if (listing.seller.toString() !== req.user!.id) throw Forbidden("Not your listing");
    const parsed = createSchema.partial().safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid payload");
    Object.assign(listing, parsed.data);
    await listing.save();
    res.json({ listing: serialize(listing.toObject()) });
  }),
);

router.delete(
  "/:id",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw NotFound("Listing not found");
    if (listing.seller.toString() !== req.user!.id) throw Forbidden("Not your listing");
    listing.status = "removed";
    await listing.save();
    res.json({ success: true });
  }),
);

router.patch(
  "/:id/status",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { status } = req.body ?? {};
    if (!["active", "sold", "reserved", "draft", "removed"].includes(status)) {
      throw BadRequest("Invalid status");
    }
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw NotFound("Listing not found");
    if (listing.seller.toString() !== req.user!.id) throw Forbidden("Not your listing");
    listing.status = status;
    await listing.save();
    res.json({ listing: serialize(listing.toObject()) });
  }),
);

router.post(
  "/:id/save",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw NotFound("Listing not found");
    listing.saves += 1;
    await listing.save();
    res.json({ saves: listing.saves });
  }),
);

router.delete(
  "/:id/save",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) throw NotFound("Listing not found");
    listing.saves = Math.max(0, listing.saves - 1);
    await listing.save();
    res.json({ saves: listing.saves });
  }),
);

const reportSchema = z.object({
  reason: z.string().min(2),
  details: z.string().max(500).optional(),
});

router.post(
  "/:id/report",
  auth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success) throw BadRequest("Invalid report");
    res.json({ reported: true });
  }),
);

function serialize(doc: unknown) {
  const obj = doc as Record<string, unknown> & { _id?: { toString(): string }; seller?: { _id?: { toString(): string } } };
  if (obj._id) obj._id = obj._id.toString();
  if (obj.seller && (obj.seller as { _id?: { toString(): string } })._id) {
    (obj.seller as Record<string, unknown>).id = (obj.seller as { _id: { toString(): string } })._id.toString();
  }
  return obj;
}

export default router;
