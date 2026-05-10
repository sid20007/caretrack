import { config } from "./config";
import { createBot } from "./bot";
import { createServer } from "./server";
import { startAlertScheduler } from "./bot/alerts";

async function main(): Promise<void> {
  const bot = createBot();
  const app = createServer();

  bot.launch();
  console.log("Bot running (long-polling)");

  startAlertScheduler(bot);

  app.listen(config.port, () => {
    console.log(`Server on :${config.port} [${config.nodeEnv}]`);
  });

  // Enable graceful stop for Railway
  process.once("SIGINT", () => {
    console.log("SIGINT received. Stopping bot...");
    bot.stop("SIGINT");
    process.exit(0);
  });
  process.once("SIGTERM", () => {
    console.log("SIGTERM received. Stopping bot...");
    bot.stop("SIGTERM");
    process.exit(0);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
