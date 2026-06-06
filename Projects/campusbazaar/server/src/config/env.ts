import { z } from "zod";
import { config } from "dotenv";

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(["development", "staging", "production"]).default("development"),
  CLIENT_URL: z.string().url().default("http://localhost:5173"),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/campusbazaar"),
  JWT_SECRET: z.string().min(8).default("dev-secret-change-me"),
  JWT_EXPIRE: z.string().default("7d"),
  UPLOAD_DIR: z.string().default("uploads"),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
