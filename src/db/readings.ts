import { supabase } from "../lib/supabase";
import { HealthReading } from "../utils/healthParser";

export async function saveReading(telegramId: number, reading: HealthReading) {
  const { error } = await supabase.from("readings").insert({
    telegram_id: telegramId,
    bp: reading.bp ?? null,
    sugar: reading.sugar ?? null,
    medicine_taken: reading.taken ?? null,
  });

  if (error) throw error;
}

export async function hasReadingSince(telegramId: number, since: Date): Promise<boolean> {
  const { data, error } = await supabase
    .from("readings")
    .select("id")
    .eq("telegram_id", telegramId)
    .gte("created_at", since.toISOString())
    .limit(1);

  if (error || !data) return false;
  return data.length > 0;
}

export interface DbReading {
  id: string;
  telegram_id: number;
  bp: string | null;
  sugar: number | null;
  medicine_taken: boolean | null;
  created_at: string;
}

export async function getWeeklyReadings(telegramId: number): Promise<DbReading[]> {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("readings")
    .select("*")
    .eq("telegram_id", telegramId)
    .gte("created_at", sevenDaysAgo.toISOString())
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as DbReading[];
}

export async function deleteAllReadings(telegramId: number) {
  const { error } = await supabase.from("readings").delete().eq("telegram_id", telegramId);
  if (error && error.code !== "PGRST116") throw error;
}
