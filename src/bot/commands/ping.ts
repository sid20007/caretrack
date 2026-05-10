import { Context } from "telegraf";

export async function pingCommand(ctx: Context): Promise<void> {
  const start = Date.now();
  const msg = await ctx.reply("Pong!");
  const latency = Date.now() - start;

  await ctx.telegram.editMessageText(
    msg.chat.id,
    msg.message_id,
    undefined,
    `Pong! ${latency}ms`
  );
}
