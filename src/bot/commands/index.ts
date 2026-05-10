import { Telegraf, Context } from "telegraf";
import { startCommand } from "./start";
import { helpCommand } from "./help";
import { pingCommand } from "./ping";
import { healthHandler, isHealthMessage } from "./health";
import { isRegistered, isOnboarding, handleOnboardingStep, startOnboarding } from "../onboarding";
import { findFamilyMember } from "../../db/familyMembers";
import { resetCommand } from "./reset";
import { summaryCommand } from "./summary";

export function registerCommands(bot: Telegraf<Context>): void {
  bot.start(startCommand);
  bot.help(helpCommand);
  bot.command("ping", pingCommand);
  bot.command("reset", resetCommand);
  bot.command("summary", summaryCommand);

  bot.on("text", async (ctx) => {
    const id = ctx.from?.id;
    if (!id) return;

    if (isOnboarding(id)) {
      return handleOnboardingStep(ctx);
    }

    if (!(await isRegistered(id))) {
      await ctx.reply("You need to register first.");
      return startOnboarding(ctx);
    }

    // family members can't submit readings
    const familyMember = await findFamilyMember(id);
    if (familyMember) {
      await ctx.reply("You're linked as a family member. You'll receive alerts if readings are missed.");
      return;
    }

    const text = (ctx.message as any)?.text ?? "";
    if (isHealthMessage(text)) return healthHandler(ctx);

    ctx.reply("Unknown input. Try /help or send a reading.");
  });
}
