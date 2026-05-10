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
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
