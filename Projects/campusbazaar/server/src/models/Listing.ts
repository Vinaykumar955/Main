import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ListingDoc extends Document {
  title: string;
  description: string;
  price: number;
  isFree: boolean;
  negotiable: boolean;
  urgent: boolean;
  swapAvailable: boolean;
  status: "active" | "sold" | "draft" | "reserved" | "removed";
  condition: "new" | "likeNew" | "good" | "fair" | "poor";
  category: { id: string; name: string; slug: string; icon: string };
  tags: string[];
  images: { url: string; alt: string; width: number; height: number }[];
  seller: mongoose.Types.ObjectId;
  hostel: { id?: string; name: string; block: string };
  views: number;
  saves: number;
  createdAt: Date;
  updatedAt: Date;
}

const listingSchema = new Schema<ListingDoc>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    isFree: { type: Boolean, default: false },
    negotiable: { type: Boolean, default: true },
    urgent: { type: Boolean, default: false },
    swapAvailable: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["active", "sold", "draft", "reserved", "removed"],
      default: "active",
      index: true,
    },
    condition: {
      type: String,
      enum: ["new", "likeNew", "good", "fair", "poor"],
      required: true,
    },
    category: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      slug: { type: String, required: true, index: true },
      icon: { type: String },
    },
    tags: [{ type: String, maxlength: 20 }],
    images: [
      {
        url: { type: String, required: true },
        alt: { type: String, default: "" },
        width: { type: Number, default: 800 },
        height: { type: Number, default: 600 },
      },
    ],
    seller: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    hostel: {
      name: { type: String, required: true, index: true },
      block: { type: String, required: true },
    },
    views: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
  },
  { timestamps: true },
);

listingSchema.index({ title: "text", description: "text", tags: "text" });
listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ "category.slug": 1, status: 1 });

listingSchema.pre("save", function (next) {
  if (this.price === 0) this.isFree = true;
  next();
});

export const Listing: Model<ListingDoc> =
  mongoose.models.Listing ?? mongoose.model<ListingDoc>("Listing", listingSchema);
