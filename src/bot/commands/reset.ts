import { Context } from "telegraf";
import { findPatient, deletePatient } from "../../db/patients";
import { findFamilyMember, deleteFamilyMember, deleteFamilyMembersByPatientId } from "../../db/familyMembers";
import { deleteAllReadings } from "../../db/readings";
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
  console.log(`Reset: Cleared onboarding session for ${id}`);

  try {
    const patient = await findPatient(id);
    if (patient && patient.patient_id) {
      // User is a patient, delete everything related
      const readingsDeleted = await deleteAllReadings(id);
      console.log(`Reset: Deleted ${readingsDeleted} readings for patient ${id}`);

      const familyDeletedCount = await deleteFamilyMembersByPatientId(patient.patient_id);
      console.log(`Reset: Deleted ${familyDeletedCount} family members linked to patient ${id}`);

      const patientDeleted = await deletePatient(id);
      console.log(`Reset: Deleted patient profile for ${id} (success: ${patientDeleted})`);
      
      await ctx.reply(`Patient profile and all related data have been deleted.\n- Readings deleted: ${readingsDeleted}\n- Linked family members deleted: ${familyDeletedCount}\nUse /start to begin again.`);
      return;
    }

    const family = await findFamilyMember(id);
    if (family) {
      // User is a family member, delete just their record
      const familyDeleted = await deleteFamilyMember(id);
      console.log(`Reset: Deleted family member profile for ${id} (success: ${familyDeleted})`);

      await ctx.reply("Family member profile deleted. Use /start to begin again.");
      return;
    }

    // Neither a patient nor a family member
    await ctx.reply("Reset complete. You have no registered profiles. Use /start to begin again.");
  } catch (err: any) {
    console.error("Reset DB error:", err.message ?? err);
    await ctx.reply(`Reset failed: ${err.message ?? "unknown error"}`);
  }
}
