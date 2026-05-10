import { Context } from "telegraf";
import { findPatient, createPatient, findPatientByCode, generatePatientCode } from "../db/patients";
import { findFamilyMember, createFamilyMember } from "../db/familyMembers";

type PatientStep = "name" | "age" | "condition";
type FamilyStep = "name" | "relationship" | "code";

interface PatientSession {
  role: "patient";
  step: PatientStep;
  name?: string;
  age?: number;
}

interface FamilySession {
  role: "family";
  step: FamilyStep;
  name?: string;
  relationship?: string;
}

type Session = { role: "choosing" } | PatientSession | FamilySession;

const sessions = new Map<number, Session>();

export async function isRegistered(telegramId: number): Promise<boolean> {
  const patient = await findPatient(telegramId);
  if (patient) return true;
  const family = await findFamilyMember(telegramId);
  return family !== null;
}

export function isOnboarding(telegramId: number): boolean {
  return sessions.has(telegramId);
}

export function clearOnboardingSession(telegramId: number): void {
  sessions.delete(telegramId);
}

export async function startOnboarding(ctx: Context): Promise<void> {
  const id = ctx.from!.id;
  sessions.set(id, { role: "choosing" });
  await ctx.reply("Are you a patient or a family member?\n1. Patient\n2. Family member");
}

export async function handleOnboardingStep(ctx: Context): Promise<void> {
  const id = ctx.from!.id;
  const text = ((ctx.message as any)?.text ?? "").trim();
  const session = sessions.get(id);
  if (!session) return;

  if (session.role === "choosing") {
    return handleRoleChoice(ctx, id, text);
  }
  if (session.role === "patient") {
    return handlePatientFlow(ctx, id, text, session);
  }
  if (session.role === "family") {
    return handleFamilyFlow(ctx, id, text, session);
  }
}

async function handleRoleChoice(ctx: Context, id: number, text: string): Promise<void> {
  if (text === "1" || text.toLowerCase() === "patient") {
    sessions.set(id, { role: "patient", step: "name" });
    await ctx.reply("What's your name?");
  } else if (text === "2" || text.toLowerCase() === "family" || text.toLowerCase() === "family member") {
    sessions.set(id, { role: "family", step: "name" });
    await ctx.reply("What's your name?");
  } else {
    await ctx.reply("Reply with 1 or 2.");
  }
}

async function handlePatientFlow(ctx: Context, id: number, text: string, session: PatientSession): Promise<void> {
  switch (session.step) {
    case "name": {
      if (text.length < 2) {
        await ctx.reply("Enter a valid name.");
        return;
      }
      session.name = text;
      session.step = "age";
      await ctx.reply("Age?");
      break;
    }
    case "age": {
      const age = parseInt(text, 10);
      if (isNaN(age) || age < 1 || age > 120) {
        await ctx.reply("Enter a valid age (1-120).");
        return;
      }
      session.age = age;
      session.step = "condition";
      await ctx.reply("Condition?\n1. BP\n2. Diabetes\n3. Both");
      break;
    }
    case "condition": {
      const input = text.toLowerCase();
      let condition: string;

      if (input === "1" || input === "bp") condition = "bp";
      else if (input === "2" || input === "diabetes") condition = "diabetes";
      else if (input === "3" || input === "both") condition = "both";
      else {
        await ctx.reply("Reply with 1, 2, or 3.");
        return;
      }

      const code = generatePatientCode();

      try {
        await createPatient({
          telegram_id: id,
          patient_name: session.name!,
          age: session.age!,
          condition,
          patient_code: code,
        });
        sessions.delete(id);
        await ctx.reply(
          [
            `Welcome, ${session.name}. Profile saved.`,
            ``,
            `Your CareTrack patient code: ${code}`,
            ``,
            `Share this code with family members so they can connect to your account for monitoring and missed-reading alerts.`,
            ``,
            `You can now send readings like: BP 130/85 Sugar 145 Taken yes`,
          ].join("\n")
        );
      } catch (err: any) {
        console.error("Patient insert failed:", err.message ?? err);
        sessions.delete(id);
        await ctx.reply("Failed to save profile. Try /start again.");
      }
      break;
    }
  }
}

async function handleFamilyFlow(ctx: Context, id: number, text: string, session: FamilySession): Promise<void> {
  switch (session.step) {
    case "name": {
      if (text.length < 2) {
        await ctx.reply("Enter a valid name.");
        return;
      }
      session.name = text;
      session.step = "relationship";
      await ctx.reply("Your relationship to the patient?\n(e.g. son, daughter, spouse, parent)");
      break;
    }
    case "relationship": {
      if (text.length < 2) {
        await ctx.reply("Enter a valid relationship.");
        return;
      }
      session.relationship = text;
      session.step = "code";
      await ctx.reply("Enter the patient's code (e.g. CT-AB3X7):");
      break;
    }
    case "code": {
      const patient = await findPatientByCode(text);
      if (!patient) {
        await ctx.reply("Invalid code. Check with the patient and try again.");
        return;
      }

      try {
        await createFamilyMember({
          patient_id: patient.patient_id!,
          family_name: session.name!,
          relationship: session.relationship!,
          telegram_id: id,
        });
        sessions.delete(id);
        await ctx.reply(
          `Linked to ${patient.patient_name}'s account.\nYou'll be notified if they miss a daily reading.`
        );
      } catch (err: any) {
        console.error("Family insert failed:", err.message ?? err);
        sessions.delete(id);
        await ctx.reply("Failed to save. Try /start again.");
      }
      break;
    }
  }
}
