import { Context } from "telegraf";
import { parseHealthReading, HealthReading } from "../../utils/healthParser";
import { saveReading } from "../../db/readings";
import { findPatient } from "../../db/patients";
import { getFamilyForPatient } from "../../db/familyMembers";

async function notifyFamily(ctx: Context, telegramId: number, reading: HealthReading) {
  try {
    const patient = await findPatient(telegramId);
    if (!patient || !patient.patient_id) return;

    const family = await getFamilyForPatient(patient.patient_id);
    if (family.length === 0) return;

    const lines: string[] = [
      `✅ ${patient.patient_name} the patient submitted today's health reading.\n`
    ];
    if (reading.bp) lines.push(`BP: ${reading.bp}`);
    if (reading.sugar !== undefined) lines.push(`Sugar: ${reading.sugar}`);
    if (reading.taken !== undefined) lines.push(`Medicine taken: ${reading.taken ? "yes" : "no"}`);

    const message = lines.join("\n");
    let sentCount = 0;

    for (const member of family) {
      try {
        await ctx.telegram.sendMessage(member.telegram_id, message);
        sentCount++;
      } catch (err: any) {
        console.error(`Failed to notify family member ${member.telegram_id}:`, err.message);
      }
    }
    console.log(`Notification sent to ${sentCount} family member(s) for patient ${patient.patient_name}`);
  } catch (err: any) {
    console.error("Error in notifyFamily:", err.message);
  }
}

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

    // Asynchronously notify family members without blocking
    notifyFamily(ctx, telegramId, reading).catch(err => 
      console.error("Unhandled error in notifyFamily promise:", err)
    );
  } catch (err: any) {
    console.error("DB insert failed:", err.message ?? err);
    await ctx.reply("Failed to save reading. Please try again.");
  }
}

export function isHealthMessage(text: string): boolean {
  return parseHealthReading(text) !== null;
}
