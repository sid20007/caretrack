import { supabase } from "../lib/supabase";

export interface FamilyMember {
  family_member_id?: string;
  patient_id: string;
  family_name: string;
  relationship: string;
  telegram_id: number;
}

export async function findFamilyMember(telegramId: number): Promise<FamilyMember | null> {
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("telegram_id", telegramId)
    .single();

  if (error || !data) return null;
  return data as FamilyMember;
}

export async function createFamilyMember(member: Omit<FamilyMember, "family_member_id">) {
  const { error } = await supabase.from("family_members").insert(member);
  if (error) throw error;
}

export async function getFamilyForPatient(patientId: string): Promise<FamilyMember[]> {
  const { data, error } = await supabase
    .from("family_members")
    .select("*")
    .eq("patient_id", patientId);

  if (error || !data) return [];
  return data as FamilyMember[];
}
export async function deleteFamilyMember(telegramId: number) {
  const { error } = await supabase.from("family_members").delete().eq("telegram_id", telegramId);
  // ignore not-found — deleting a non-existent row is fine during reset
  if (error && error.code !== "PGRST116") throw error;
}

export async function deleteFamilyMembersByPatientId(patientId: string) {
  const { error } = await supabase.from("family_members").delete().eq("patient_id", patientId);
  if (error && error.code !== "PGRST116") throw error;
}
