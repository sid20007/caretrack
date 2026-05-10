import { config } from "./config";
import { createBot } from "./bot";
import { createServer } from "./server";

async function main(): Promise<void> {
  const bot = createBot();
  const app = createServer();

  if (config.isProd && config.webhookUrl) {
    const webhookPath = `/webhook/${config.botToken}`;
    app.use(bot.webhookCallback(webhookPath));
    await bot.telegram.setWebhook(`${config.webhookUrl}${webhookPath}`);
    console.log(`Webhook registered: ${config.webhookUrl}${webhookPath}`);
  } else {
    bot.launch();
    console.log("Bot running (long-polling)");
  }

  app.listen(config.port, () => {
    console.log(`Server on :${config.port} [${config.nodeEnv}]`);
  });
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
