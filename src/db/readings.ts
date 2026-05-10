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
