# CareTrack - Railway Deployment Guide

This guide covers everything you need to successfully deploy the Telegram healthcare bot backend to [Railway](https://railway.app/).

## 1. Prerequisites
- A GitHub repository containing your project code.
- A Railway account connected to your GitHub.
- Your Supabase database running with the required `patients`, `family_members`, and `readings` tables.
- Your Telegram bot token from `@BotFather`.

## 2. Deploying on Railway

1. Go to your Railway dashboard and click **New Project**.
2. Select **Deploy from GitHub repo** and choose your CareTrack repository.
3. Railway will automatically detect that this is a Node.js project. It will use the `npm run build` and `npm start` scripts defined in your `package.json` to build and run the bot.

## 3. Environment Variables

Before the deployment finishes, navigate to the **Variables** tab for your service in Railway and add the following production variables:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Ensures the alert system runs every 4 hours instead of every minute, and disables the `/reset` dev command. |
| `BOT_TOKEN` | `your-telegram-token` | From @BotFather. |
| `SUPABASE_URL` | `https://xyz.supabase.co` | Your Supabase project URL. |
| `SUPABASE_ANON_KEY` | `ey...` | Your Supabase project Anon API Key. |

*(Note: You do not need to set `PORT`; Railway injects this automatically).*

## 4. Why This Setup works perfectly for Railway

- **Start Scripts**: Your `package.json` comes with `"build": "tsc"` and `"start": "node dist/index.js"`. Railway natively recognizes and executes these.
- **Graceful Shutdown**: Telegraf polling mode can throw "409 Conflict" errors if two instances run simultaneously during a redeployment. The `index.ts` file is configured to catch Railway's `SIGINT` and `SIGTERM` signals and gracefully stop the old bot instance before the new one takes over.
- **Health Check**: Railway determines if a deployment is healthy by looking for an open port. `server/index.ts` boots up an Express server and binds to the injected `PORT`. It also exposes a `/health` endpoint that Railway (or any uptime monitor) can ping to verify the bot is alive.
- **Polling over Webhooks**: Long-polling is robust and requires no custom DNS or SSL setup.

## 5. Post-Deployment Checklist
- [ ] Check the **Deployments** tab logs to ensure you see `Bot running (long-polling)` and `Server on :[PORT] [production]`.
- [ ] Message your bot on Telegram `/ping` to confirm it responds.
- [ ] Ensure that `/reset` now correctly returns *"Reset is only available in development mode."*
- [ ] Monitor the Supabase logs to verify database connectivity.
