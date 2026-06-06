import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import path from "node:path";
import fs from "node:fs";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { logger } from "./utils/logger.js";
import authRouter from "./routes/auth.js";
import listingsRouter from "./routes/listings.js";
import categoriesRouter from "./routes/categories.js";
import messagesRouter from "./routes/messages.js";
import notificationsRouter from "./routes/notifications.js";
import usersRouter from "./routes/users.js";
import uploadsRouter from "./routes/uploads.js";
import adminRouter from "./routes/admin.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  }),
);
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Serve uploaded files
const uploadRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (fs.existsSync(uploadRoot)) {
  app.use(`/${env.UPLOAD_DIR}`, express.static(uploadRoot));
}

app.use(
  "/api/",
  rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.use("/api/auth", authRouter);
app.use("/api/listings", listingsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/users", usersRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/admin", adminRouter);

app.use((_req, res) => {
  res.status(404).json({ success: false, code: "NOT_FOUND", message: "Route not found" });
});

app.use(errorHandler);

export default app;
