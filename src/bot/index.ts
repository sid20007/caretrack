import { Telegraf, Context } from "telegraf";
import { config } from "../config";
import { registerCommands } from "./commands";

export function createBot(): Telegraf<Context> {
  if (!config.botToken) {
    throw new Error("BOT_TOKEN missing from .env");
  }

  const bot = new Telegraf(config.botToken);
  registerCommands(bot);

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));

  return bot;
}
