import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import { Category } from "./models/Category.js";
import { User } from "./models/User.js";
import { Listing } from "./models/Listing.js";

const categories = [
  { name: "Routers & Networking", slug: "routers", icon: "Wifi", order: 1 },
  { name: "Textbooks & Notes", slug: "textbooks", icon: "BookOpen", order: 2 },
  { name: "Electronics & Gadgets", slug: "electronics", icon: "Smartphone", order: 3 },
  { name: "Furniture & Decor", slug: "furniture", icon: "Armchair", order: 4 },
  { name: "Cycles & Wheels", slug: "cycles", icon: "Bike", order: 5 },
  { name: "Kitchen & Cookware", slug: "kitchen", icon: "UtensilsCrossed", order: 6 },
  { name: "Sports & Fitness", slug: "sports", icon: "Dumbbell", order: 7 },
  { name: "Clothing & Accessories", slug: "clothing", icon: "Shirt", order: 8 },
  { name: "Fest Essentials", slug: "fest", icon: "PartyPopper", order: 9 },
  { name: "Free Zone", slug: "free", icon: "Gift", order: 10 },
  { name: "Skill Exchange", slug: "services", icon: "Handshake", order: 11 },
  { name: "Other", slug: "other", icon: "Package", order: 12 },
];

async function seed() {
  await connectDB();
  logger.info("seed.start");

  await Category.deleteMany({});
  await Category.insertMany(categories);
  logger.info({ count: categories.length }, "seed.categories");

  // Optional demo user
  const existing = await User.findOne({ email: "aarav@hostel.edu" });
  if (!existing) {
    const me = await User.create({
      name: "Aarav Sharma",
      username: "aarav_x",
      email: "aarav@hostel.edu",
      password: "password123",
      hostel: { name: "NC 1", block: "Block A" },
      room: "B-204",
      yearOfStudy: 3,
      course: "B.Tech CSE",
      role: "admin",
      verified: true,
    });
    logger.info({ id: me.id }, "seed.user");

    // Seed a couple of listings
    await Listing.deleteMany({});
    await Listing.create([
      {
        title: "TP-Link Archer C20 — barely used",
        description:
          "Bought last semester, used for 3 months, replaced with a mesh system. Works perfectly. Pickup from NC 1, room B-204.",
        price: 800,
        condition: "good",
        category: { id: "c1", name: "Routers & Networking", slug: "routers", icon: "Wifi" },
        tags: ["wifi", "cash-on-pickup"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&auto=format&fit=crop",
            alt: "TP-Link router",
            width: 800,
            height: 600,
          },
        ],
        seller: me._id,
        hostel: { name: "NC 1", block: "Block A" },
        status: "active",
      },
      {
        title: "HC Verma · Concepts of Physics Vol 2",
        description:
          "Latest edition, with handwritten notes from the topper. Some pencil marks but very useful. Pickup from mess area.",
        price: 350,
        condition: "good",
        category: { id: "c2", name: "Textbooks & Notes", slug: "textbooks", icon: "BookOpen" },
        tags: ["physics", "notes"],
        images: [
          {
            url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop",
            alt: "Physics textbook",
            width: 800,
            height: 600,
          },
        ],
        seller: me._id,
        hostel: { name: "NC 1", block: "Block A" },
        status: "active",
      },
    ]);
    logger.info("seed.listings");
  }

  logger.info("seed.done");
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, "seed.failed");
  process.exit(1);
});

void env; // satisfy unused import warning when running
