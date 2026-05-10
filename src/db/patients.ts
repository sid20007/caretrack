import { supabase } from "../lib/supabase";

export interface Patient {
  patient_id?: string;
  telegram_id: number;
  patient_name: string;
  age: number;
  condition: string;
  patient_code: string;
}

export function generatePatientCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
  let code = "CT-";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export async function findPatient(telegramId: number): Promise<Patient | null> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  if (error || !data) return null;
  return data as Patient;
}

export async function findPatientByCode(code: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from("patients")
    .select("*")
    .eq("patient_code", code.toUpperCase())
    .single();

  if (error || !data) return null;
  return data as Patient;
}

export async function createPatient(patient: Omit<Patient, "patient_id">) {
  const { error } = await supabase.from("patients").insert(patient);
  if (error) throw error;
}

export async function getAllPatientIds(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from("patients")
    .select("patient_id, telegram_id, patient_name, patient_code");

  if (error || !data) return [];
  return data as Patient[];
}
export async function deletePatient(telegramId: number) {
  const { error } = await supabase.from("patients").delete().eq("telegram_id", telegramId);
  // ignore not-found — deleting a non-existent row is fine during reset
  if (error && error.code !== "PGRST116") throw error;
}
