import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface CategoryDoc extends Document {
  name: string;
  slug: string;
  description?: string;
  icon: string;
  parent?: mongoose.Types.ObjectId | null;
  isActive: boolean;
  order: number;
  listingCount: number;
}

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    icon: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    listingCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Category: Model<CategoryDoc> =
  mongoose.models.Category ?? mongoose.model<CategoryDoc>("Category", categorySchema);
