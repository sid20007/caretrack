import { createClient } from "@supabase/supabase-js";
import { config } from "../config";

if (!config.supabaseUrl || !config.supabaseKey) {
  throw new Error("SUPABASE_URL or SUPABASE_ANON_KEY missing from .env");
}

export const supabase = createClient(config.supabaseUrl, config.supabaseKey);
