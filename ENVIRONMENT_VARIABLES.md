# Environment Variables

Environment variables required to run CodingAnthem. Set these in **Vercel → Project → Settings → Environment Variables** for Production, Preview, and Development.

Locally, these live in `.env.local` (gitignored, never committed).

---

## Required

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string, used by the URL Shortener backend (`lib/mongodb.ts`) and the AI global usage counter (`lib/aiUsage.ts`). Must point to the `codinganthem` database. | `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/codinganthem?retryWrites=true&w=majority&appName=<cluster>` |
| `GEMINI_API_KEY` | Google Gemini API key, used by all AI tools (`lib/gemini.ts`) — AI Code Explainer, AI Text-to-SQL Generator, AI Error Message Explainer. Server-only, never exposed to the browser. Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). | `AIza...` |

---

## Optional

| Variable | Description | Default if unset |
|---|---|---|
| `NEXT_PUBLIC_BASE_URL` | Base URL used to build short links returned by `/api/shorten`. | `https://codinganthem.com` |
| `AI_TOOLS_ENABLED` | Kill switch for all AI tools. Set to `false` in the Vercel dashboard to instantly disable every AI route (no deploy needed) if costs spike or abuse is detected. | `true` (enabled) |

---

## Setup checklist (Vercel)

1. Go to the Vercel dashboard → select the `codinganthem` project
2. **Settings → Environment Variables**
3. Add `MONGODB_URI` → paste the connection string → check all three environments (Production, Preview, Development) → **Save**
4. Trigger a redeploy (or push a commit) so the new variable takes effect

## Setup checklist (local development)

1. Create `.env.local` in the project root (already gitignored)
2. Add:
   ```
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/codinganthem?retryWrites=true&w=majority&appName=<cluster>
   ```
3. Restart `npm run dev` after adding or changing any env var

---

## MongoDB Atlas configuration notes

- **Network Access**: must allow `0.0.0.0/0` (Vercel serverless functions use dynamic IPs, so specific IP allowlisting isn't possible)
- **Database user**: dedicated user (`codinganthem_admin`) scoped to this project only — not shared with other projects
- **Database name**: `codinganthem` (set via `dbName` option in `lib/mongodb.ts`, not required to be in the URI path)
