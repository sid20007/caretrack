import { Telegraf } from "telegraf";
import { getAllPatientIds } from "../db/patients";
import { hasReadingToday } from "../db/readings";
import { getFamilyForPatient } from "../db/familyMembers";

const ALERT_INTERVAL_MS = 4 * 60 * 60 * 1000; // every 4 hours

export function startAlertScheduler(bot: Telegraf): void {
  setInterval(() => checkMissedReadings(bot), ALERT_INTERVAL_MS);
  console.log("Alert scheduler started (4h interval)");
}

async function checkMissedReadings(bot: Telegraf): Promise<void> {
  try {
    const patients = await getAllPatientIds();

    for (const patient of patients) {
      const hasReading = await hasReadingToday(patient.telegram_id);
      if (hasReading) continue;

      const family = await getFamilyForPatient(patient.patient_id!);
      for (const member of family) {
        try {
          await bot.telegram.sendMessage(
            member.telegram_id,
            `${patient.patient_name} hasn't logged a reading today.`
          );
        } catch (err: any) {
          // user may have blocked the bot, skip
          console.error(`Alert to ${member.telegram_id} failed:`, err.message);
        }
      }
    }
  } catch (err: any) {
    console.error("Alert check failed:", err.message);
  }
}
