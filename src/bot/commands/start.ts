import { Context } from "telegraf";

export async function startCommand(ctx: Context): Promise<void> {
  const name = ctx.from?.first_name ?? "there";
  await ctx.reply(`Hey ${name}. Send your readings like: BP 130/85 Sugar 145 Taken yes`);
}
