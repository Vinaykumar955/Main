/**
 * Global domain types — keep all "shape of data" definitions here so any module
 * can import them without cross-feature cycles.
 */

export type ID = string;
export type ISODate = string;

export type UserRole = "user" | "moderator" | "admin";

export interface User {
  id: ID;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  hostel: Hostel;
  room?: string;
  yearOfStudy?: number;
  course?: string;
  role: UserRole;
  verified: boolean;
  rating: number;
  ratingsCount: number;
  joinedAt: ISODate;
  lastSeenAt: ISODate;
  listingsCount: number;
  soldCount: number;
}

export interface Hostel {
  id: ID;
  name: string;
  block: string;
  capacity: number;
  occupants: number;
  verified: boolean;
  floorReps: ID[];
}

export type ListingStatus = "active" | "sold" | "draft" | "reserved" | "removed";
export type Condition = "new" | "likeNew" | "good" | "fair" | "poor";

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description: string;
  icon: string;
  count: number;
  parent?: ID | null;
}

export interface ListingImage {
  id: ID;
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface Listing {
  id: ID;
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  negotiable: boolean;
  urgent: boolean;
  swapAvailable: boolean;
  status: ListingStatus;
  condition: Condition;
  category: Category;
  tags: string[];
  images: ListingImage[];
  seller: Pick<User, "id" | "name" | "username" | "avatar" | "verified" | "rating" | "listingsCount" | "soldCount" | "room"> & {
    hostel: string;
  };
  hostel: Pick<Hostel, "id" | "name" | "block">;
  views: number;
  saves: number;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface ListingFilter {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: Condition[];
  status?: ListingStatus;
  hostel?: string;
  sellerId?: ID;
  sort?: SortOption;
  page?: number;
  limit?: number;
}

export type SortOption =
  | "newest"
  | "oldest"
  | "price-asc"
  | "price-desc"
  | "most-viewed"
  | "most-saved"
  | "nearest";

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  hasMore: boolean;
}

export interface Message {
  id: ID;
  conversationId: ID;
  sender: Pick<User, "id" | "name" | "username" | "avatar">;
  content: string;
  read: boolean;
  createdAt: ISODate;
}

export interface Conversation {
  id: ID;
  participants: Array<Pick<User, "id" | "name" | "username" | "avatar" | "verified">>;
  listing?: Pick<Listing, "id" | "title" | "images" | "price">;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: ISODate;
}

export interface Notification {
  id: ID;
  type:
    | "message"
    | "offer"
    | "saved"
    | "system"
    | "listing_sold"
    | "listing_view"
    | "review";
  title: string;
  body: string;
  read: boolean;
  link?: string;
  createdAt: ISODate;
}

export interface Report {
  id: ID;
  reporterId: ID;
  listingId: ID;
  reason: "spam" | "inappropriate" | "scam" | "wrong-category" | "duplicate" | "other";
  details?: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: ISODate;
}

export interface AuthSession {
  user: User;
  token: string;
  expiresAt: ISODate;
}

export interface FavoriteEntry {
  listingId: ID;
  savedAt: ISODate;
}

export interface Review {
  id: ID;
  reviewer: Pick<User, "id" | "name" | "username" | "avatar">;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  createdAt: ISODate;
}

export interface Telemetry {
  onlineUsers: number;
  activeListings: number;
  transactionsToday: number;
  uptimePct: number;
  buildHash: string;
  route: string;
  env: string;
  serverTime: ISODate;
}
