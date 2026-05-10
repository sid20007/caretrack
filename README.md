# may-sugar-bot

Telegram bot backend powered by Express + Telegraf (TypeScript).

## Setup

1. `npm i`
2. `cp .env.example .env` and add your `BOT_TOKEN` (from [@BotFather](https://t.me/BotFather))

## Dev

```bash
npm run dev
```
Starts Express on `http://localhost:3000` and bot in long-polling mode with hot-reload.

## Prod (Webhook)

To run the bot using Telegram webhooks instead of long-polling, set the following environment variables:

- `NODE_ENV=production`
- `WEBHOOK_URL=https://your-domain.com` (Must be HTTPS)

```bash
npm run build && npm start
```

## Architecture

- `src/bot/commands/` - Bot command handlers
- `src/server/` - Express API routes (healthcheck at `/health`)
- `src/config/` - Environment configuration
- `src/index.ts` - App entry point
