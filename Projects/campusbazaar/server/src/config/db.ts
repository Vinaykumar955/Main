import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

/**
 * Connect to MongoDB. In development we *don't* crash on failure so the
 * frontend stays usable with the in-memory store. In production we fail fast
 * because data persistence is non-negotiable.
 *
 * Mongoose's connection continues to emit `error` events internally while
 * it retries — we swallow them so they don't bubble up as unhandled errors.
 */
export async function connectDB(): Promise<boolean> {
  if (!env.MONGODB_URI) {
    logger.warn("mongo.no_uri_configured");
    return false;
  }
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    // Prevent unhandled `error` events from killing the Node process while
    // the connection is in a retry loop.
    mongoose.connection.on("error", (err) => {
      logger.warn({ err: err?.message ?? String(err) }, "mongo.connection_error");
    });
    mongoose.connection.on("disconnected", () => {
      logger.warn("mongo.disconnected");
    });
    logger.info({ host: conn.connection.host }, "mongo.connected");
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error({ err: message }, "mongo.connection_failed");
    if (env.NODE_ENV === "production") {
      throw err;
    }
    logger.warn("mongo.continuing_without_db");
    return false;
  }
}
