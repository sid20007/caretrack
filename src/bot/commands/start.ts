import { Context } from "telegraf";
import { isRegistered, isOnboarding, startOnboarding } from "../onboarding";

export async function startCommand(ctx: Context): Promise<void> {
  const id = ctx.from?.id;
  if (!id) return;

  if (await isRegistered(id)) {
    await ctx.reply("You're already registered. Send your readings anytime.");
    return;
  }

  await startOnboarding(ctx);
}
