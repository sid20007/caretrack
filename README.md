# CareTrack

CareTrack started as a simple thought:

Why are we still forcing elderly people to learn complicated healthcare apps just to share basic health updates with their family?

Most parents already know how to use Telegram or WhatsApp. They send messages every day. So instead of building another app they would never open, I built a system that works inside a chat itself.

The idea is simple:
- patients log BP, sugar levels, or medicine updates naturally through Telegram
- family members stay informed remotely
- if a reading is missed, the system alerts the family automatically

No dashboards.  
No complicated onboarding.  
Just conversation-based healthcare tracking.

---

## Why I built this

I wasn't trying to build another healthcare app. The real problem I noticed was communication.

A lot of families want to keep track of their parents' health remotely, but constant phone calls become exhausting for both sides. At the same time, most elderly users are uncomfortable with modern healthcare apps filled with dashboards, logins, and notifications.

CareTrack tries to reduce that friction by turning healthcare updates into something as simple as sending a message.

---

## What CareTrack does

- **Conversational onboarding:** Role-based flow for patients and family.
- **Family linking:** Securely connects family members using unique patient codes.
- **Natural language logging:** Patients type naturally, e.g., `BP 130/80 Sugar 110 Taken yes`.
- **Missed-reading alerts:** Automatically detects if a daily reading is missed and warns family.
- **Medicine confirmations:** Instant notifications when medicine is logged.
- **Weekly summaries:** Calculates 7-day averages for BP, sugar, and adherence.

---

## How it works

1. Patient starts the Telegram bot.
2. Patient receives a unique CareTrack code.
3. Family member joins using that code.
4. Patient logs daily health readings via text.
5. Family members receive instant medicine confirmations, missed-reading alerts, and weekly summaries.

### Architecture

```text
Patient → Telegram Bot → Backend Parser → Supabase DB
                                      ↓
                             Family Notifications
```

---

## Tech Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express
- Telegraf

### Database & Infrastructure
- Supabase (PostgreSQL)
- Railway (Backend deployment)
- Vercel (Frontend deployment)

---

## Screenshots


- patient onboarding
- family linking
- missed-reading alert
- medicine confirmation
- weekly summary

---

## Local Setup

Clone the repository:

```bash
git clone https://github.com/sid20007/caretrack.git
cd caretrack
npm install
```

Create a `.env` file:

```env
BOT_TOKEN=your_telegram_bot_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=development
PORT=3000
```

Run locally:

```bash
npm run dev
```

---

## Long-term vision

Right now CareTrack focuses on basic vitals (BP, sugar) and medicine adherence. But the bigger idea is building lightweight healthcare infrastructure that works through messaging platforms people already use daily.

Future directions:
- WhatsApp integration
- AI-generated health trend summaries
- Multilingual support
- Voice-note health logging
- Wearable integrations
- Anomaly detection for dangerous readings
- Webhook migration for better scale

The goal is not replacing hospitals or doctors. 

The goal is making remote family healthcare coordination simpler and more human.
