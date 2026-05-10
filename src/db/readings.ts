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

export async function hasReadingToday(telegramId: number): Promise<boolean> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("readings")
    .select("id")
    .eq("telegram_id", telegramId)
    .gte("created_at", todayStart.toISOString())
    .limit(1);

  if (error || !data) return false;
  return data.length > 0;
}
