import { Telegraf, Context } from "telegraf";
import { startCommand } from "./start";
import { helpCommand } from "./help";
import { pingCommand } from "./ping";
import { healthHandler, isHealthMessage } from "./health";

export function registerCommands(bot: Telegraf<Context>): void {
  bot.start(startCommand);
  bot.help(helpCommand);
  bot.command("ping", pingCommand);

  bot.on("text", (ctx) => {
    const text = (ctx.message as any)?.text ?? "";
    if (isHealthMessage(text)) return healthHandler(ctx);
    ctx.reply("Unknown input. Try /help.");
  });
}
