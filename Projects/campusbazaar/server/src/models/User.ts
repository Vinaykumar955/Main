import mongoose, { Schema, type Document, type Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface UserDoc extends Document {
  name: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  hostel: { name: string; block: string };
  room?: string;
  yearOfStudy?: number;
  course?: string;
  role: "user" | "moderator" | "admin";
  verified: boolean;
  ratingsCount: number;
  ratingSum: number;
  joinedAt: Date;
  lastSeenAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false, minlength: 8 },
    phone: { type: String, trim: true },
    bio: { type: String, maxlength: 280 },
    avatar: { type: String },
    hostel: {
      name: { type: String, required: true },
      block: { type: String, required: true },
    },
    room: { type: String, trim: true },
    yearOfStudy: { type: Number, min: 1, max: 7 },
    course: { type: String, trim: true },
    role: { type: String, enum: ["user", "moderator", "admin"], default: "user", index: true },
    verified: { type: Boolean, default: false },
    ratingsCount: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

userSchema.virtual("rating").get(function () {
  return this.ratingsCount > 0 ? this.ratingSum / this.ratingsCount : 0;
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

userSchema.set("toJSON", {
  virtuals: true,
  transform: (_, ret) => {
    delete (ret as { password?: string }).password;
    delete (ret as { __v?: number }).__v;
    return ret;
  },
});

export const User: Model<UserDoc> = mongoose.models.User ?? mongoose.model<UserDoc>("User", userSchema);
