import type {
  User,
  Listing,
  Message,
  Notification,
  Conversation,
  Category,
  Hostel,
  Review,
  Paginated,
} from "@/types/domain";
import { formatPrice, timeAgo, initials } from "@/lib/utils";

const NOW = new Date();
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();

export const hostels: Hostel[] = [
  { id: "h1", name: "NC 1", block: "Block A", capacity: 240, occupants: 218, verified: true, floorReps: ["u1", "u2"] },
  { id: "h2", name: "NC 2", block: "Block B", capacity: 240, occupants: 196, verified: true, floorReps: ["u3"] },
  { id: "h3", name: "NC 3", block: "Block C", capacity: 220, occupants: 188, verified: true, floorReps: ["u4"] },
  { id: "h4", name: "NC 4", block: "Block D", capacity: 220, occupants: 142, verified: true, floorReps: ["u5"] },
  { id: "h5", name: "NC 5", block: "Block E", capacity: 200, occupants: 174, verified: true, floorReps: ["u6"] },
  { id: "h6", name: "NC 6", block: "Block F", capacity: 200, occupants: 158, verified: false, floorReps: [] },
  { id: "h7", name: "Zakir A", block: "Wing A", capacity: 180, occupants: 165, verified: true, floorReps: ["u7"] },
  { id: "h8", name: "Zakir B", block: "Wing B", capacity: 180, occupants: 152, verified: true, floorReps: ["u8"] },
  { id: "h9", name: "Zakir C", block: "Wing C", capacity: 160, occupants: 138, verified: true, floorReps: ["u9"] },
  { id: "h10", name: "Zakir D", block: "Wing D", capacity: 160, occupants: 121, verified: false, floorReps: [] },
];

export const HOSTEL_NAMES = hostels.map((h) => h.name) as [string, ...string[]];

export const categories: Category[] = [
  { id: "c1", slug: "routers", name: "Routers & Networking", description: "Wi-Fi routers, extenders, ethernet", icon: "Wifi", count: 48 },
  { id: "c2", slug: "textbooks", name: "Textbooks & Notes", description: "Course books, lab manuals, topper notes", icon: "BookOpen", count: 312 },
  { id: "c3", slug: "electronics", name: "Electronics & Gadgets", description: "Phones, earphones, calculators, drives", icon: "Smartphone", count: 187 },
  { id: "c4", slug: "furniture", name: "Furniture & Decor", description: "Chairs, tables, lamps, shelves", icon: "Armchair", count: 96 },
  { id: "c5", slug: "cycles", name: "Cycles & Wheels", description: "Cycles, skateboards, accessories", icon: "Bike", count: 27 },
  { id: "c6", slug: "kitchen", name: "Kitchen & Cookware", description: "Induction, kettles, utensils, tiffin", icon: "UtensilsCrossed", count: 64 },
  { id: "c7", slug: "sports", name: "Sports & Fitness", description: "Bats, weights, yoga, gym gear", icon: "Dumbbell", count: 38 },
  { id: "c8", slug: "clothing", name: "Clothing & Accessories", description: "Ethnic, formal, jackets, shoes", icon: "Shirt", count: 152 },
  { id: "c9", slug: "fest", name: "Fest Essentials", description: "Decorations, costumes, lights", icon: "PartyPopper", count: 41 },
  { id: "c10", slug: "free", name: "Free Zone", description: "Give-aways and donations", icon: "Gift", count: 18 },
  { id: "c11", slug: "services", name: "Skill Exchange", description: "Tutoring, repairs, freelance help", icon: "Handshake", count: 22 },
  { id: "c12", slug: "other", name: "Other", description: "Anything else", icon: "Package", count: 71 },
];

const NAMES = [
  ["Aarav Sharma", "aarav_x"],
  ["Diya Patel", "diya.codes"],
  ["Rohan Mehta", "rohanm"],
  ["Isha Verma", "ishav"],
  ["Kabir Singh", "kabir_s"],
  ["Ananya Iyer", "ananya_i"],
  ["Vihaan Reddy", "vihaan"],
  ["Saanvi Kapoor", "saanvi.k"],
  ["Aditya Rao", "aditya_r"],
  ["Priya Nair", "priya_n"],
  ["Arjun Bose", "arjun.b"],
  ["Kavya Menon", "kavya.m"],
] as const;

export const users: User[] = NAMES.map(([name, username], i) => {
  const hostel = hostels[i % hostels.length]!;
  return {
    id: `u${i + 1}`,
    name,
    username,
    email: `${username}@hostel.edu`,
    avatar: i % 3 === 0 ? `https://i.pravatar.cc/120?img=${i + 5}` : undefined,
    bio: "Hostel floor 3 · CSE · 3rd year · side hustle: web dev",
    hostel,
    room: `B-${(200 + i * 3).toString()}`,
    yearOfStudy: (i % 4) + 1,
    course: ["B.Tech CSE", "B.Tech ECE", "M.Tech AI", "BBA"][i % 4]!,
    role: i === 0 ? "admin" : i < 3 ? "moderator" : "user",
    verified: i % 2 === 0,
    rating: 4.2 + (i % 5) * 0.1,
    ratingsCount: 12 + i * 3,
    joinedAt: daysAgo(180 - i * 12),
    lastSeenAt: hoursAgo(i % 6),
    listingsCount: 6 + (i % 9),
    soldCount: 3 + (i % 5),
  };
});

const TITLES_BY_CAT: Record<string, string[]> = {
  routers: [
    "TP-Link Archer C20 — barely used",
    "Wi-Fi extender (works, dusty)",
    "Old Jio Fiber router (free)",
  ],
  textbooks: [
    "Engineering Mathematics — 4th sem, latest edition",
    "HC Verma · Concepts of Physics Vol 2 (with notes)",
    "Topper's notes — DSA, semester 4 (PDF + printed)",
  ],
  electronics: [
    "Boat Airdopes 141 — case replaced, 6m used",
    "Casio fx-991ES calculator (no scratches)",
    "SanDisk 64GB pendrive (working)",
  ],
  furniture: [
    "Study lamp — foldable, white",
    "Foldable chair — for balcony",
    "Wooden shelf — 3 tier, 4ft",
  ],
  cycles: [
    "BSA Ladybird cycle — gear issue but rides",
    "Skateboard (board only)",
    "Cycle lock + basket",
  ],
  kitchen: [
    "Prestige induction cooktop",
    "Electric kettle — 1.5L (works perfectly)",
    "Borosil tiffin + bottle set",
  ],
  sports: [
    "Yonex Mavis 350 — 6 shuttlecocks",
    "Adjustable dumbbell — 10kg",
    "Football size 5 (lightly used)",
  ],
  clothing: [
    "Sherwani set (worn once for fresher's)",
    "Black blazer — 38R (fest collection)",
    "Woollen jacket — North-face replica, size M",
  ],
  fest: [
    "Diwali diyas + led string lights",
    "Holi water gun set (3 pieces)",
    "Christmas fairy lights — 5m",
  ],
  free: [
    "Old cycle (free, picks up only)",
    "Magazine bundle — give away",
  ],
  services: [
    "Maths tutor — class 11/12 (₹200/hr)",
    "Laptop repair — chip-level",
    "Haircut at your room — ₹80",
  ],
  other: [
    "Extension board (4 socket)",
    "Umbrella (kinda broken)",
    "Old PS2 controller",
  ],
};

const SAMPLE_IMAGES: Record<string, string[]> = {
  routers: [
    "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=800&auto=format&fit=crop",
  ],
  textbooks: [
    "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop",
  ],
  electronics: [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop",
  ],
  furniture: [
    "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=800&auto=format&fit=crop",
  ],
  cycles: [
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=800&auto=format&fit=crop",
  ],
  kitchen: [
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1546554137-f86b9593a222?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop",
  ],
  sports: [
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&auto=format&fit=crop",
  ],
  clothing: [
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=800&auto=format&fit=crop",
  ],
  fest: [
    "https://images.unsplash.com/photo-1512389142860-9c449e58a543?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop",
  ],
  free: [
    "https://images.unsplash.com/photo-1530989241248-3a8d4be37f9a?w=800&auto=format&fit=crop",
  ],
  services: [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
  ],
  other: [
    "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop",
  ],
};

function buildListings(): Listing[] {
  const listings: Listing[] = [];
  let counter = 1;
  for (const cat of categories) {
    const titles = TITLES_BY_CAT[cat.slug] ?? ["Untitled item"];
    const imgs = SAMPLE_IMAGES[cat.slug] ?? ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800"];
    for (let i = 0; i < Math.max(titles.length, 3); i++) {
      const t = titles[i % titles.length] ?? "Untitled item";
      const seller = users[(counter + i) % users.length]!;
      const isFree = cat.slug === "free" || (counter % 13 === 0);
      const isUrgent = counter % 9 === 0;
      const swap = cat.slug === "services" || counter % 11 === 0;
      const price = isFree ? 0 : Math.round(((counter * 137) % 4800) + 100);
      const condition = (["new", "likeNew", "good", "fair", "poor"] as const)[counter % 5]!;
      const status = counter % 17 === 0 ? "sold" : counter % 23 === 0 ? "reserved" : "active";
      listings.push({
        id: `l${counter}`,
        title: t,
        description:
          `Bought last semester, used for a few months and it's been sitting on my shelf since. ` +
          `Everything works as expected. Pickup from ${seller.hostel.name}, room ${seller.room}. ` +
          `Reasonable offers welcome; cash on pickup. ` +
          `Can demo in the common room. Drop a message and I'll get back between classes.`,
        price,
        isFree,
        negotiable: !isFree,
        urgent: isUrgent,
        swapAvailable: swap,
        status,
        condition,
        category: cat,
        tags: ["hostel-2", "cash-on-pickup", seller.hostel.name.toLowerCase()].slice(0, 3),
        images: imgs.slice(0, 2).map((url, idx) => ({
          id: `img-${counter}-${idx}`,
          url,
          alt: t,
          width: 800,
          height: 600,
        })),
        seller: {
          id: seller.id,
          name: seller.name,
          username: seller.username,
          avatar: seller.avatar,
          verified: seller.verified,
          rating: seller.rating,
          listingsCount: seller.listingsCount,
          soldCount: seller.soldCount,
          hostel: seller.hostel.name,
          room: seller.room,
        },
        hostel: { id: seller.hostel.id, name: seller.hostel.name, block: seller.hostel.block },
        views: 12 + (counter * 7) % 480,
        saves: 1 + (counter * 3) % 60,
        createdAt: hoursAgo(counter * 5),
        updatedAt: hoursAgo(counter * 3),
      });
      counter++;
    }
  }
  return listings;
}

export const listings: Listing[] = buildListings();

export const reviews: Review[] = [
  {
    id: "r1",
    reviewer: { id: "u2", name: "Diya Patel", username: "diya.codes", avatar: undefined },
    rating: 5,
    body: "Met at the common room, item was exactly as described. Super smooth.",
    createdAt: daysAgo(2),
  },
  {
    id: "r2",
    reviewer: { id: "u3", name: "Rohan Mehta", username: "rohanm", avatar: undefined },
    rating: 4,
    body: "Good communication, slight delay in pickup but worth it.",
    createdAt: daysAgo(5),
  },
  {
    id: "r3",
    reviewer: { id: "u4", name: "Isha Verma", username: "ishav", avatar: undefined },
    rating: 5,
    body: "Floor rep sealed, no haggling needed. Will buy again.",
    createdAt: daysAgo(9),
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv1",
    participants: [
      { id: "u1", name: "Aarav Sharma", username: "aarav_x", avatar: undefined, verified: true },
      { id: "u2", name: "Diya Patel", username: "diya.codes", avatar: undefined, verified: false },
    ],
    listing: { id: "l1", title: listings[0]?.title ?? "Router", images: listings[0]?.images ?? [], price: listings[0]?.price ?? 0 },
    lastMessage: {
      id: "m1",
      conversationId: "conv1",
      sender: { id: "u2", name: "Diya Patel", username: "diya.codes", avatar: undefined },
      content: "Is it still available? Can I pick up at 5?",
      read: false,
      createdAt: hoursAgo(0.5),
    },
    unreadCount: 1,
    updatedAt: hoursAgo(0.5),
  },
  {
    id: "conv2",
    participants: [
      { id: "u1", name: "Aarav Sharma", username: "aarav_x", avatar: undefined, verified: true },
      { id: "u3", name: "Rohan Mehta", username: "rohanm", avatar: undefined, verified: true },
    ],
    listing: { id: "l12", title: listings[11]?.title ?? "Lamp", images: listings[11]?.images ?? [], price: listings[11]?.price ?? 0 },
    lastMessage: {
      id: "m2",
      conversationId: "conv2",
      sender: { id: "u1", name: "Aarav Sharma", username: "aarav_x", avatar: undefined },
      content: "Sure, common room works. See you at 7.",
      read: true,
      createdAt: hoursAgo(3),
    },
    unreadCount: 0,
    updatedAt: hoursAgo(3),
  },
  {
    id: "conv3",
    participants: [
      { id: "u1", name: "Aarav Sharma", username: "aarav_x", avatar: undefined, verified: true },
      { id: "u4", name: "Isha Verma", username: "ishav", avatar: undefined, verified: true },
    ],
    listing: { id: "l20", title: listings[19]?.title ?? "Textbook", images: listings[19]?.images ?? [], price: listings[19]?.price ?? 0 },
    lastMessage: {
      id: "m3",
      conversationId: "conv3",
      sender: { id: "u4", name: "Isha Verma", username: "ishav", avatar: undefined },
      content: "Marked as sold. Thanks!",
      read: true,
      createdAt: hoursAgo(28),
    },
    unreadCount: 0,
    updatedAt: hoursAgo(28),
  },
];

export const messages: Record<string, Message[]> = {
  conv1: [
    {
      id: "m1a",
      conversationId: "conv1",
      sender: { id: "u1", name: "Aarav Sharma", username: "aarav_x", avatar: undefined },
      content: "Hey, is the router still up for grabs?",
      read: true,
      createdAt: hoursAgo(2),
    },
    {
      id: "m1b",
      conversationId: "conv1",
      sender: { id: "u2", name: "Diya Patel", username: "diya.codes", avatar: undefined },
      content: "Yes! Works perfectly. Pickup from BH-1, room B-204.",
      read: true,
      createdAt: hoursAgo(1.5),
    },
    {
      id: "m1c",
      conversationId: "conv1",
      sender: { id: "u2", name: "Diya Patel", username: "diya.codes", avatar: undefined },
      content: "Is it still available? Can I pick up at 5?",
      read: false,
      createdAt: hoursAgo(0.5),
    },
  ],
  conv2: [
    {
      id: "m2a",
      conversationId: "conv2",
      sender: { id: "u3", name: "Rohan Mehta", username: "rohanm", avatar: undefined },
      content: "Hi, can I see the lamp working before I buy?",
      read: true,
      createdAt: hoursAgo(4),
    },
    {
      id: "m2b",
      conversationId: "conv2",
      sender: { id: "u1", name: "Aarav Sharma", username: "aarav_x", avatar: undefined },
      content: "Sure, common room works. See you at 7.",
      read: true,
      createdAt: hoursAgo(3),
    },
  ],
  conv3: [
    {
      id: "m3a",
      conversationId: "conv3",
      sender: { id: "u4", name: "Isha Verma", username: "ishav", avatar: undefined },
      content: "Got the textbook. Notes are super helpful.",
      read: true,
      createdAt: hoursAgo(30),
    },
    {
      id: "m3b",
      conversationId: "conv3",
      sender: { id: "u4", name: "Isha Verma", username: "ishav", avatar: undefined },
      content: "Marked as sold. Thanks!",
      read: true,
      createdAt: hoursAgo(28),
    },
  ],
};

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "message",
    title: "NEW_MESSAGE",
    body: "Diya Patel asked about the TP-Link router",
    read: false,
    link: "/messages",
    createdAt: hoursAgo(0.5),
  },
  {
    id: "n2",
    type: "offer",
    title: "OFFER_RECEIVED",
    body: "Rohan Mehta offered ₹1,800 on your lamp",
    read: false,
    link: "/messages",
    createdAt: hoursAgo(2),
  },
  {
    id: "n3",
    type: "saved",
    title: "PRICE_DROP",
    body: "An item you saved is now ₹200 cheaper",
    read: true,
    link: "/saved",
    createdAt: hoursAgo(8),
  },
  {
    id: "n4",
    type: "system",
    title: "FLOOR_REP_UPDATE",
    body: "BH-2 floor 3 now has a verified floor rep",
    read: true,
    createdAt: hoursAgo(20),
  },
  {
    id: "n5",
    type: "listing_view",
    title: "ITEM_TRENDING",
    body: "Your listing got 24 views in the last hour",
    read: true,
    link: "/listing/l1",
    createdAt: hoursAgo(24),
  },
];

export const currentUser = users[0]!;

export function paginate<T>(items: T[], page: number, limit: number): Paginated<T> {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);
  return {
    items: slice,
    total,
    page,
    pages,
    hasMore: page < pages,
  };
}

export function searchListings(query: string, sort: string = "-createdAt") {
  if (!query) return paginate(listings, 1, 24);
  const q = query.toLowerCase();
  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(q) ||
      l.description.toLowerCase().includes(q) ||
      l.category.name.toLowerCase().includes(q) ||
      l.tags.some((t) => t.toLowerCase().includes(q)),
  );
  return paginate(filtered, 1, 24);
}

export function getListings(filter: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  hostel?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Paginated<Listing> {
  let items = [...listings];
  if (filter.search) {
    const q = filter.search.toLowerCase();
    items = items.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.category.name.toLowerCase().includes(q),
    );
  }
  if (filter.category) {
    items = items.filter((l) => l.category.slug === filter.category);
  }
  if (filter.hostel) {
    items = items.filter((l) => l.hostel.name === filter.hostel);
  }
  if (typeof filter.minPrice === "number") {
    items = items.filter((l) => l.price >= filter.minPrice!);
  }
  if (typeof filter.maxPrice === "number") {
    items = items.filter((l) => l.price <= filter.maxPrice!);
  }
  if (filter.condition && filter.condition.length) {
    items = items.filter((l) => filter.condition!.includes(l.condition));
  }

  // simple sort
  const sortKey = filter.sort ?? "-createdAt";
  const desc = sortKey.startsWith("-");
  const key = sortKey.replace(/^-/, "") as keyof Listing;
  items.sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (typeof av === "number" && typeof bv === "number") {
      return desc ? bv - av : av - bv;
    }
    if (typeof av === "string" && typeof bv === "string") {
      return desc ? bv.localeCompare(av) : av.localeCompare(bv);
    }
    return 0;
  });

  return paginate(items, filter.page ?? 1, filter.limit ?? 24);
}

export { formatPrice, timeAgo, initials };
