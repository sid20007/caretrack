import { Context } from "telegraf";
import { findFamilyMember } from "../../db/familyMembers";
import { getPatientById } from "../../db/patients";
import { getWeeklyReadings } from "../../db/readings";

export async function summaryCommand(ctx: Context): Promise<void> {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  const family = await findFamilyMember(telegramId);
  if (!family) {
    await ctx.reply("Only family members can view health summaries.");
    return;
  }

  const patient = await getPatientById(family.patient_id);
  if (!patient) {
    await ctx.reply("Could not find the linked patient.");
    return;
  }

  const readings = await getWeeklyReadings(patient.telegram_id);
  if (readings.length === 0) {
    await ctx.reply(`No readings found for ${patient.patient_name} in the last 7 days.`);
    return;
  }

  let systolicSum = 0;
  let diastolicSum = 0;
  let bpCount = 0;

  let sugarSum = 0;
  let sugarCount = 0;

  let medTakenCount = 0;
  let medTotalCount = 0;

  const uniqueDays = new Set<string>();

  for (const r of readings) {
    const dateStr = new Date(r.created_at).toISOString().split("T")[0];
    uniqueDays.add(dateStr);

    if (r.bp) {
      const match = r.bp.match(/(\d+)\/(\d+)/);
      if (match) {
        systolicSum += parseInt(match[1], 10);
        diastolicSum += parseInt(match[2], 10);
        bpCount++;
      }
    }

    if (r.sugar !== null) {
      sugarSum += r.sugar;
      sugarCount++;
    }

    if (r.medicine_taken !== null) {
      if (r.medicine_taken) medTakenCount++;
      medTotalCount++;
    }
  }

  const avgSystolic = bpCount > 0 ? Math.round(systolicSum / bpCount) : null;
  const avgDiastolic = bpCount > 0 ? Math.round(diastolicSum / bpCount) : null;
  const avgSugar = sugarCount > 0 ? Math.round(sugarSum / sugarCount) : null;
  const adherence = medTotalCount > 0 ? Math.round((medTakenCount / medTotalCount) * 100) : 0;

  const missedDays = 7 - uniqueDays.size;

  const lines: string[] = [
    `📊 Weekly Health Summary`,
    ``,
    `Patient: ${patient.patient_name}`,
    ``,
  ];

  if (avgSystolic !== null && avgDiastolic !== null) {
    lines.push(`Average BP: ${avgSystolic}/${avgDiastolic}`);
  } else {
    lines.push(`Average BP: N/A`);
  }

  if (avgSugar !== null) {
    lines.push(`Average Sugar: ${avgSugar} mg/dL`);
  } else {
    lines.push(`Average Sugar: N/A`);
  }

  lines.push(`Medicine adherence: ${adherence}%`);
  lines.push(`Missed readings: ${missedDays < 0 ? 0 : missedDays}`);

  await ctx.reply(lines.join("\n"));
}
