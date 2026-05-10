import { Context } from "telegraf";
import { parseHealthReading } from "../../utils/healthParser";
import { saveReading } from "../../db/readings";

export async function healthHandler(ctx: Context): Promise<void> {
  const text = (ctx.message as any)?.text;
  if (!text) return;

  const reading = parseHealthReading(text);
  if (!reading) return;

  const telegramId = ctx.from?.id;
  if (!telegramId) {
    await ctx.reply("Could not identify your Telegram account.");
    return;
  }

  try {
    await saveReading(telegramId, reading);

    const lines: string[] = ["Reading saved.\n"];
    if (reading.bp) lines.push(`BP: ${reading.bp}`);
    if (reading.sugar !== undefined) lines.push(`Sugar: ${reading.sugar} mg/dL`);
    if (reading.taken !== undefined) lines.push(`Medicine taken: ${reading.taken ? "yes" : "no"}`);

    await ctx.reply(lines.join("\n"));
  } catch (err: any) {
    console.error("DB insert failed:", err.message ?? err);
    await ctx.reply("Failed to save reading. Please try again.");
  }
}

export function isHealthMessage(text: string): boolean {
  return parseHealthReading(text) !== null;
}
