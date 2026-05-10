import { Context } from "telegraf";
import { deletePatient } from "../../db/patients";
import { deleteFamilyMember } from "../../db/familyMembers";
import { clearOnboardingSession } from "../onboarding";
import { config } from "../../config";

export async function resetCommand(ctx: Context): Promise<void> {
  if (config.nodeEnv !== "development") {
    await ctx.reply("Reset is only available in development mode.");
    return;
  }

  const id = ctx.from?.id;
  if (!id) return;

  // Clear session first regardless of DB outcome
  clearOnboardingSession(id);

  try {
    await deleteFamilyMember(id);
    await deletePatient(id);
    await ctx.reply("Reset done. Use /start to register again.");
  } catch (err: any) {
    console.error("Reset DB error:", err.message ?? err);
    await ctx.reply(`Reset failed: ${err.message ?? "unknown error"}`);
  }
}
