/**
 * Local in-memory store that mirrors the backend shape. Lets the entire UI work
 * end-to-end without a server during dev. Swap with real `api` calls by
 * importing from `@/services` once the backend is up.
 */
import {
  listings as seedListings,
  users as seedUsers,
  categories as seedCategories,
  conversations as seedConversations,
  messages as seedMessages,
  notifications as seedNotifications,
  hostels as seedHostels,
  reviews as seedReviews,
  paginate,
  currentUser,
} from "./mockData";
import type {
  Listing,
  User,
  Category,
  Conversation,
  Message,
  Notification,
  Hostel,
  Review,
  Paginated,
  ListingFilter,
} from "@/types/domain";
import { sleep } from "@/lib/utils";

interface State {
  listings: Listing[];
  users: User[];
  categories: Category[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  notifications: Notification[];
  hostels: Hostel[];
  reviews: Review[];
  currentUser: User;
}

const state: State = {
  listings: [...seedListings],
  users: [...seedUsers],
  categories: [...seedCategories],
  conversations: [...seedConversations],
  messages: { ...seedMessages },
  notifications: [...seedNotifications],
  hostels: [...seedHostels],
  reviews: [...seedReviews],
  currentUser,
};

export const localStore = {
  // listings
  getListings(filter: ListingFilter = {}): Paginated<Listing> {
    let items = [...state.listings];
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
    if (filter.sellerId) {
      items = items.filter((l) => l.seller.id === filter.sellerId);
    }
    if (filter.status) {
      items = items.filter((l) => l.status === filter.status);
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
    if (filter.condition?.length) {
      items = items.filter((l) => filter.condition!.includes(l.condition));
    }
    const sortKey = filter.sort ?? "newest";
    items = items.slice().sort((a, b) => {
      switch (sortKey) {
        case "newest":
          return b.createdAt.localeCompare(a.createdAt);
        case "oldest":
          return a.createdAt.localeCompare(b.createdAt);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "most-viewed":
          return b.views - a.views;
        case "most-saved":
          return b.saves - a.saves;
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return paginate(items, filter.page ?? 1, filter.limit ?? 24);
  },

  getListing(id: string): Listing | undefined {
    return state.listings.find((l) => l.id === id);
  },

  recordView(id: string) {
    const listing = state.listings.find((l) => l.id === id);
    if (listing) listing.views += 1;
  },

  similar(id: string): Listing[] {
    const listing = state.listings.find((l) => l.id === id);
    if (!listing) return [];
    return state.listings
      .filter((l) => l.id !== id && l.category.id === listing.category.id)
      .slice(0, 6);
  },

  createListing(payload: Omit<Listing, "id" | "createdAt" | "updatedAt" | "views" | "saves">): Listing {
    const id = `l${state.listings.length + 1}`;
    const now = new Date().toISOString();
    const listing: Listing = {
      ...payload,
      id,
      views: 0,
      saves: 0,
      createdAt: now,
      updatedAt: now,
    };
    state.listings = [listing, ...state.listings];
    return listing;
  },

  updateListing(id: string, patch: Partial<Listing>): Listing | undefined {
    const idx = state.listings.findIndex((l) => l.id === id);
    if (idx < 0) return undefined;
    state.listings[idx] = { ...state.listings[idx]!, ...patch, updatedAt: new Date().toISOString() };
    return state.listings[idx];
  },

  setStatus(id: string, status: Listing["status"]): Listing | undefined {
    return this.updateListing(id, { status });
  },

  deleteListing(id: string): boolean {
    const before = state.listings.length;
    state.listings = state.listings.filter((l) => l.id !== id);
    return state.listings.length < before;
  },

  // users
  getUser(username: string): User | undefined {
    return state.users.find((u) => u.username === username || u.id === username);
  },

  getUserListings(userId: string): Listing[] {
    return state.listings.filter((l) => l.seller.id === userId);
  },

  // categories
  getCategories(): Category[] {
    return state.categories;
  },

  // conversations / messages
  getConversations(): Conversation[] {
    return state.conversations;
  },

  getMessages(conversationId: string): Message[] {
    return state.messages[conversationId] ?? [];
  },

  sendMessage(conversationId: string, content: string): Message {
    const conv = state.conversations.find((c) => c.id === conversationId);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    const msg: Message = {
      id: `m${Date.now()}`,
      conversationId,
      sender: {
        id: state.currentUser.id,
        name: state.currentUser.name,
        username: state.currentUser.username,
        avatar: state.currentUser.avatar,
      },
      content,
      read: false,
      createdAt: new Date().toISOString(),
    };
    const list = state.messages[conversationId] ?? [];
    state.messages[conversationId] = [...list, msg];
    conv.lastMessage = msg;
    conv.updatedAt = msg.createdAt;
    conv.unreadCount = 0;
    return msg;
  },

  // notifications
  getNotifications(): Notification[] {
    return state.notifications;
  },

  // hostels
  getHostels(): Hostel[] {
    return state.hostels;
  },

  // reviews
  getReviews(userId: string): Review[] {
    return state.reviews;
  },

  /**
   * In-memory auth for the mock/dev environment. Lets the entire app work
   * end-to-end without a server running. The real backend (or Supabase) is
   * the source of truth in production — see `features/auth/authService.ts`.
   */
  async signIn(input: { email: string; password: string }): Promise<{ user: User; token: string }> {
    await sleep(180);
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    if (password.length < 8) throw new Error("Min 8 characters");
    const user =
      state.users.find((u) => u.email.toLowerCase() === email) ?? {
        ...state.currentUser,
        email,
        username: email.split("@")[0] ?? "guest",
      };
    return { user, token: `mock.${user.id}.${Date.now().toString(36)}` };
  },

  async signUp(input: {
    name: string;
    username: string;
    email: string;
    password: string;
    hostel: string;
    room?: string;
    yearOfStudy?: number;
    course?: string;
  }): Promise<{ user: User; token: string }> {
    await sleep(220);
    const email = input.email.trim().toLowerCase();
    const username = input.username.trim().toLowerCase();
    if (state.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error("Email already on the floor");
    }
    if (state.users.some((u) => u.username.toLowerCase() === username)) {
      throw new Error("Username taken");
    }
    const hostel =
      state.hostels.find((h) => h.name === input.hostel) ?? state.hostels[0]!;
    const user: User = {
      id: `u${state.users.length + 1}`,
      name: input.name,
      username,
      email,
      avatar: undefined,
      bio: `Hostel ${hostel.name} · ${input.course ?? "Student"} · ${input.yearOfStudy ?? "—"} yr`,
      hostel,
      room: input.room || "—",
      yearOfStudy: input.yearOfStudy ?? 1,
      course: input.course || "—",
      role: "user",
      verified: false,
      rating: 0,
      ratingsCount: 0,
      joinedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
      listingsCount: 0,
      soldCount: 0,
    };
    state.users = [user, ...state.users];
    return { user, token: `mock.${user.id}.${Date.now().toString(36)}` };
  },
};

export async function fakeAsync<T>(value: T, ms = 220): Promise<T> {
  await sleep(ms);
  return value;
}
