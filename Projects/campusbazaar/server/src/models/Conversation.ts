import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ConversationDoc extends Document {
  participants: mongoose.Types.ObjectId[];
  listing?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<ConversationDoc>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
    listing: { type: Schema.Types.ObjectId, ref: "Listing" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1, lastMessageAt: -1 });

export const Conversation: Model<ConversationDoc> =
  mongoose.models.Conversation ??
  mongoose.model<ConversationDoc>("Conversation", conversationSchema);
