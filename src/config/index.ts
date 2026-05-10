import dotenv from "dotenv";
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN ?? "",
  port: parseInt(process.env.PORT ?? "3000", 10),
  nodeEnv: process.env.NODE_ENV ?? "development",
  webhookUrl: process.env.WEBHOOK_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseKey: process.env.SUPABASE_ANON_KEY ?? "",

  get isProd(): boolean {
    return this.nodeEnv === "production";
  },
} as const;
