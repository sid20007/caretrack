import { Context } from "telegraf";

export async function helpCommand(ctx: Context): Promise<void> {
  await ctx.reply(
    [
      "Commands:",
      "/start  - start the bot",
      "/help   - show this message",
      "/ping   - check latency",
      "",
      "Send readings as plain text:",
      "BP 130/85 Sugar 145 Taken yes",
    ].join("\n")
  );
}
