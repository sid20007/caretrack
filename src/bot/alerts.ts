import { Telegraf } from "telegraf";
import { getAllPatientIds } from "../db/patients";
import { hasReadingSince } from "../db/readings";
import { getFamilyForPatient } from "../db/familyMembers";
import { config } from "../config";

const IS_DEV = config.nodeEnv === "development";
const ALERT_INTERVAL_MS = IS_DEV ? 60 * 1000 : 4 * 60 * 60 * 1000;

export function startAlertScheduler(bot: Telegraf): void {
  setInterval(() => checkMissedReadings(bot), ALERT_INTERVAL_MS);
  console.log(`Alert scheduler started (${IS_DEV ? '1m' : '4h'} interval)`);
}

async function checkMissedReadings(bot: Telegraf): Promise<void> {
  console.log("Running alert check...");
  let patientsScanned = 0;
  let alertsSent = 0;

  try {
    const patients = await getAllPatientIds();
    patientsScanned = patients.length;

    for (const patient of patients) {
      const since = new Date();
      if (IS_DEV) {
        since.setMinutes(since.getMinutes() - 1);
      } else {
        since.setHours(0, 0, 0, 0);
      }

      const hasReading = await hasReadingSince(patient.telegram_id, since);
      if (hasReading) continue;

      const family = await getFamilyForPatient(patient.patient_id!);
      for (const member of family) {
        try {
          await bot.telegram.sendMessage(
            member.telegram_id,
            `⚠️ ${patient.patient_name} the patient has not submitted today's health reading.`
          );
          alertsSent++;
        } catch (err: any) {
          // user may have blocked the bot, skip
          console.error(`Alert to ${member.telegram_id} failed:`, err.message);
        }
      }
    }
  } catch (err: any) {
    console.error("Alert check failed:", err.message);
  } finally {
    console.log(`Alert check complete. Patients scanned: ${patientsScanned}. Alerts sent: ${alertsSent}.`);
  }
}
