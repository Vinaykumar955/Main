import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface NotificationDoc extends Document {
  user: mongoose.Types.ObjectId;
  type: "message" | "offer" | "saved" | "system" | "listing_sold" | "listing_view" | "review";
  title: string;
  body?: string;
  read: boolean;
  readAt?: Date;
  link?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, required: true, enum: ["message", "offer", "saved", "system", "listing_sold", "listing_view", "review"] },
    title: { type: String, required: true },
    body: { type: String },
    read: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    link: { type: String },
  },
  { timestamps: true },
);

export const Notification: Model<NotificationDoc> =
  mongoose.models.Notification ??
  mongoose.model<NotificationDoc>("Notification", notificationSchema);
