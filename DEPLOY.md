# Deploying JD Learn

Your **frontend** is already live on Netlify (`jd-learn.netlify.app`). It shows
"Server error (404)" on registration because the **backend (server) is not
deployed yet**. The frontend needs a running backend to talk to.

This guide deploys the backend on **Railway** (simple, has a GitHub deploy + a
persistent disk), then connects Netlify to it.

---

## STEP 1 — Deploy the backend on Railway

1. Go to **railway.app** → sign in with GitHub.
2. **New Project → Deploy from GitHub repo** → pick this repository.
3. Open the service → **Settings**:
   - **Root Directory:** `server`
   - **Start Command:** leave default (`npm start`)
4. **Settings → Networking → Generate Domain.** Copy the URL it gives you,
   e.g. `https://jdlearn-production.up.railway.app` — this is your **backend URL**.

## STEP 2 — Add a Volume (so the database survives restarts)

1. Service → **Settings → Volumes → New Volume.**
2. **Mount path:** `/app/prisma`
   (the SQLite database `dev.db` lives there and will now persist.)

## STEP 3 — Add Variables

Service → **Variables** → add these (use your real values):

```
JWT_SECRET            = (a long random string — see below)
DATABASE_URL          = file:./dev.db
NODE_ENV              = production
CLIENT_URL            = https://jd-learn.netlify.app
SITE_URL              = https://jd-learn.netlify.app
API_URL               = https://YOUR-backend.up.railway.app   ← the domain from step 1.4
EMAIL_HOST            = smtp.gmail.com
EMAIL_PORT            = 587
EMAIL_HOST_USER       = jd.school.admin@gmail.com
EMAIL_HOST_PASSWORD   = your_gmail_app_password
DEFAULT_FROM_EMAIL    = jd.school.admin@gmail.com
FROM_NAME             = JD Learn
STRIPE_SECRET_KEY     = sk_live_...   ← from Stripe Dashboard → Developers → API keys
STRIPE_WEBHOOK_SECRET = whsec_...     ← from the webhook endpoint you create in Step 4b
```

`NODE_ENV=production` is required — the server now refuses to boot in production
without a real `JWT_SECRET` (no more silent fallback to a guessable dev secret).

Generate JWT_SECRET locally with:
`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### STEP 3b — Stripe (real payments)

Course purchases and paid live-session bookings go through **Stripe Checkout** —
there is no fake/instant payment path anymore.

1. Create a Stripe account (or use your existing one) at stripe.com.
2. **Developers → API keys** → copy the **Secret key** → `STRIPE_SECRET_KEY`.
   Start with the **test mode** key while you verify everything end-to-end;
   switch to the **live** key only once you're ready to take real money.
3. **Developers → Webhooks → Add endpoint**:
   - URL: `https://YOUR-backend.up.railway.app/api/stripe/webhook`
   - Event: `checkout.session.completed`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`.
4. To test locally before deploying: `stripe listen --forward-to localhost:4000/api/stripe/webhook`
   (Stripe CLI) — it prints a temporary webhook secret to put in `server/.env`.
5. Use Stripe's test card `4242 4242 4242 4242` (any future date/CVC) to confirm
   a purchase actually creates an `Order` + `Enrollment` row after checkout.

## STEP 4 — Create the database tables (ONE TIME)

The very first time, the database needs its tables + the demo accounts.
- Temporarily set **Start Command** to: `npm run db:setup && npm start`
- Deploy. Watch the logs — it should print “Seed complete!”.
- Then change **Start Command** back to: `npm start` and redeploy.

(Do NOT leave `db:setup` in the start command — it would wipe data on every restart.)

### ⚠️ Change the demo passwords before advertising the site

`db:setup` also creates demo accounts with public, guessable passwords
(`admin@jdlearn.com` / `admin123`, `teacher@jdlearn.com` / `teacher123`,
`student@jdlearn.com` / `student123`). Anyone who reads this repo's seed file
can log in as admin on your live site. Before you run ads:

- Run `npm run create-admin -- you@yourdomain.com "A-strong-password!"` (via
  Railway's one-off shell/CLI) to create **your own** admin account, and
- Either delete the demo accounts from the database, or change their passwords
  the same way.

## STEP 5 — Connect Netlify to the backend

1. Netlify → your site → **Site configuration → Environment variables → Add**:
   - `VITE_API_URL` = `https://YOUR-backend.up.railway.app` (same backend URL)
2. **Deploys → Trigger deploy → Deploy site** (rebuild so the variable applies).

## DONE ✓
Open `https://jd-learn.netlify.app/register` and create an account — the
confirmation email arrives, and after confirming you can sign in.

---

### Notes
- Keeping **SQLite + Volume** means local and production behave identically.
  For large scale later, switch `provider` in `server/prisma/schema.prisma` to
  `postgresql` and point `DATABASE_URL` at a Railway PostgreSQL plugin.
- Render works too (same idea): Web Service, root `server`, add a Disk at
  `/app/prisma`, set the same env vars.
- Mux / Daily.co / Stripe stay disabled until you add their keys.
