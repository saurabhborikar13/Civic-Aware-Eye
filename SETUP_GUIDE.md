# CivicSense — Setup, API Keys & Deployment Guide

This guide assumes **zero prior knowledge**. Follow it top to bottom.

Your project now has three parts:
- `backend/` — Node.js/Express API + MongoDB (unchanged, this is the engine)
- `frontend/` — the original multi-page HTML/CSS/JS site (kept, untouched, as a backup/reference)
- `frontend-react/` — **new**, the rebuilt React UI (this is what you'll actually use going forward)

---

## 1. Install the tools you need (one-time, on your computer)

1. **Node.js** (JavaScript runtime) — download the "LTS" installer for your OS from
   https://nodejs.org and run it. Verify it worked by opening a terminal
   (Command Prompt/PowerShell on Windows, Terminal on Mac) and typing:
   ```
   node -v
   npm -v
   ```
   Both should print a version number.
2. **Git** (optional but recommended) — https://git-scm.com/downloads
3. **A code editor** — VS Code is a good free choice: https://code.visualstudio.com
4. **A MongoDB database** — you don't install MongoDB yourself; you create a free
   cloud database (see step 3 below).

---

## 2. Project folders — what to run where

Open **two terminal windows** (you'll run the backend in one, the frontend in the other).

### Terminal 1 — Backend (the API + database connection)
```
cd civic/backend
npm install          # downloads all backend dependencies, one-time
cp .env.example .env # creates your real config file from the template
```
Now open the new `.env` file in your editor and fill in the real values —
see Section 3 below for exactly where to get each one.

Then start it:
```
npm run dev
```
You should see `Server running in development mode on port 5000`. Leave this running.

### Terminal 2 — Frontend (the new React app)
```
cd civic/frontend-react
npm install
npm run dev
```
This prints a local URL, normally `http://localhost:5173`. Open that in your
browser — that's your app. It talks to the backend automatically (already
configured via a dev proxy in `vite.config.js`).

That's it for local development. Sign up as a citizen, file a report, and it
will show up in MongoDB and on the map.

---

## 3. Where every API key / secret goes

All of these go into `civic/backend/.env` (never into the frontend — the
frontend never holds secret keys, only the backend does).

| Variable | What it's for | Where to get it |
|---|---|---|
| `MONGODB_URI` | Your database connection string | **MongoDB Atlas** (free tier): go to https://www.mongodb.com/cloud/atlas/register → create a free cluster → "Connect" → "Drivers" → copy the connection string. Replace `<user>`, `<password>`, and add a database name, e.g. `mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/civicsense`. Also go to **Network Access** in Atlas and add `0.0.0.0/0` (allow from anywhere) so your server can connect, especially once deployed. |
| `JWT_SECRET` | Signs login tokens so sessions can't be forged | Make up any long random string yourself, e.g. run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and paste the output. Don't use a real word/phrase. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_EMAIL` | Sends verification/status emails via Gmail | Use your own Gmail address for `SMTP_USER`/`SMTP_FROM`/`ADMIN_EMAIL`. For `SMTP_PASS`, you **cannot** use your normal Gmail password — go to https://myaccount.google.com/apppasswords, create an "App Password" (you'll need 2-Step Verification turned on for your Google account first), and paste that 16-character code. Keep `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`. |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_PHONE` | Sends SMS notifications | Sign up free at https://www.twilio.com → your Console Dashboard shows the Account SID and Auth Token directly → get a trial phone number under **Phone Numbers → Manage → Buy a number** (free trial numbers are provided). Optional: if you don't need SMS yet, you can leave these blank and just remove/ignore SMS features. |
| `GEMINI_API_KEY` | Powers the "Describe with AI" photo-analysis button on the report form | Go to https://aistudio.google.com/apikey, sign in with a Google account, click "Create API key", and paste it here. Free tier is generous enough for testing. |
| `FRONTEND_URL` | Tells the backend which site is allowed to call it (CORS) | Locally: `http://localhost:5173`. In production: your deployed frontend's URL (see deployment section). |

Never commit your real `.env` file to GitHub — `.gitignore` already excludes it.

---

## 4. Deploying from scratch (Render.com, free tier)

Render is the path of least resistance here since `civic/render.yaml` is
already set up for it. You'll deploy the backend as a web service (it also
serves the React build as static files, so you only need **one** service).

### Step A — Push your code to GitHub
1. Create a free GitHub account if you don't have one: https://github.com/join
2. Create a new empty repository (e.g. `civicsense`).
3. From your project's root folder (`civic/`):
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/civicsense.git
   git push -u origin main
   ```

### Step B — Build the React frontend for production
```
cd frontend-react
npm run build
```
This creates a `frontend-react/dist` folder with the final, optimized static
site. Commit this too (or set up Render to run the build for you — see below).

### Step C — Create the Render service
1. Sign up at https://render.com (free) and connect your GitHub account.
2. Click **New → Blueprint**, pick your `civicsense` repo. Render will read
   `render.yaml` automatically and propose a web service called
   `civicsense-api`.
3. Before deploying, in the Render dashboard set the **secret environment
   variables** listed in `render.yaml` (`MONGODB_URI`, `JWT_SECRET`,
   `SMTP_*`, `TWILIO_*`, `GEMINI_API_KEY`, `FRONTEND_URL`) — same values as
   your local `.env`.
4. Change `FRONTEND_STATIC_DIR` in `render.yaml` (or the dashboard) to point
   at `frontend-react/dist` instead of `frontend/public`, so the server
   serves your new React build:
   ```
   FRONTEND_STATIC_DIR=/opt/render/project/src/frontend-react/dist
   ```
5. Change the build command to also build the frontend:
   ```
   buildCommand: npm install && cd frontend-react && npm install && npm run build
   ```
6. Click **Apply** / **Deploy**. Render will install dependencies, build the
   React app, and start `node backend/server.js`. First deploy takes a few
   minutes.
7. Once live, Render gives you a URL like `https://civicsense-api.onrender.com`
   — that's your entire app (frontend + API on the same domain, so no extra
   CORS setup is needed).

### Notes
- The free Render plan spins down after inactivity; the first request after
  idling can take ~30–60 seconds to wake up. This is normal.
- File uploads are stored on a small persistent disk (`render.yaml` already
  configures a 1 GB disk mounted at the uploads folder) so photos survive
  restarts.
- If you'd rather host the React frontend separately (e.g. on Vercel/Netlify)
  and keep the backend on Render as a pure API, set `VITE_API_URL` in
  `frontend-react/.env` to your Render backend URL before running
  `npm run build`, and add that frontend's URL to `FRONTEND_URL` on the
  backend.

---

## 5. What changed vs. the original app

- The old `frontend/` (plain HTML/CSS/JS, 15+ separate pages) still exists
  untouched — nothing was deleted.
- `frontend-react/` is a from-scratch React (Vite) rebuild of every citizen
  and municipal page, calling the **same backend API** — no backend code was
  changed, so both frontends can talk to it.
- Two things worth knowing about the existing backend, unrelated to this
  rewrite:
  1. `backend/routes/admin/*` (a fuller admin API with employee assignment,
     analytics, etc.) exists in the codebase but is **not wired up** in
     `server.js` — only the plain `/api/v1/complaints` endpoints are live.
     The new Admin Dashboard therefore uses those live endpoints (view all
     reports, change status) rather than the unmounted admin API.
  2. The rewards/ratings pages have no dedicated backend endpoints in the
     original app either (they only ever read achievement points) — the new
     Rewards page keeps that same behavior with a sample redemption catalog.
