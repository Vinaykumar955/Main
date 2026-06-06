import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { logger } from "./utils/logger.js";
import app from "./app.js";

async function start() {
  // Don't let a MongoDB outage stop the server from listening. The
  // frontend's local store keeps the dev experience working.
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, "server.listening");
  });

  // Don't crash on a port conflict — log it clearly so the dev knows
  // another instance is already serving the same port.
  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.fatal(
        { port: env.PORT },
        "server.port_in_use — another instance is already running. Stop it or change PORT in server/.env.",
      );
      process.exit(1);
    }
    logger.fatal({ err }, "server.unexpected_error");
    process.exit(1);
  });
}

start().catch((err) => {
  logger.fatal({ err }, "server.failed_to_start");
  process.exit(1);
});
