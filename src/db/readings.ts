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
