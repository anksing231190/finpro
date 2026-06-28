# Apex Credit — AI Credit Assessment

A web application for credit analysts to upload borrower documents, auto-extract financial fields using AI, and generate a credit assessment score.

**Stack:** Vanilla JS · Vite · Supabase (Auth, Postgres, Storage) · Vercel

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Supabase Setup — Staging](#3-supabase-setup--staging)
4. [Supabase Setup — Production](#4-supabase-setup--production)
5. [Database Schema](#5-database-schema)
6. [Storage Bucket](#6-storage-bucket)
7. [Auth Configuration](#7-auth-configuration)
8. [Environment Files](#8-environment-files)
9. [Running Locally (Dev / Staging)](#9-running-locally-dev--staging)
10. [Testing a Staging Build Locally](#10-testing-a-staging-build-locally)
11. [Deploying to Vercel — Staging](#11-deploying-to-vercel--staging)
12. [Deploying to Vercel — Production](#12-deploying-to-vercel--production)
13. [Git Branching Strategy](#13-git-branching-strategy)
14. [npm Scripts Reference](#14-npm-scripts-reference)
15. [Optional: SMS OTP (Indian Mobiles)](#15-optional-sms-otp-indian-mobiles)
16. [Optional: Custom SMTP for High Volume Email](#16-optional-custom-smtp-for-high-volume-email)
17. [Environment Variable Reference](#17-environment-variable-reference)

---

## 1. Architecture Overview

```
Browser (Vite static build)
    │
    ├── Supabase Auth      → OTP login via email / mobile
    ├── Supabase Postgres  → users, assessments, documents metadata
    └── Supabase Storage   → uploaded document files

Hosted on Vercel (static CDN, no backend server)

Two completely separate Supabase projects:
    finpro-staging   ← used by dev and staging Vercel deployment
    finpro-prod      ← used only by production Vercel deployment
```

There is no backend server. All API calls go directly from the browser to Supabase using the public anon key. Row-Level Security (RLS) on every table ensures each user can only access their own data.

---

## 2. Prerequisites

Install these before starting:

| Tool | Version | Download |
|---|---|---|
| Node.js | 18 or higher | nodejs.org |
| Git | Any recent | git-scm.com |
| A Supabase account | Free | supabase.com |
| A Vercel account | Free | vercel.com |
| A GitHub account | Free | github.com |

Clone the repository:

```bash
git clone https://github.com/anksing231190/finpro.git
cd finpro
npm install
```

---

## 3. Supabase Setup — Staging

> Do this once for the staging environment.

**Step 1 — Create a new Supabase project**

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Name it: `finpro-staging`
4. Choose region: **Southeast Asia (Singapore)** — lowest latency for India
5. Set a strong database password and save it somewhere safe
6. Click **Create new project** and wait ~2 minutes for it to provision

**Step 2 — Run the database schema**

1. In your project, go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste and run the full SQL from [Section 5 — Database Schema](#5-database-schema) below
4. You should see "Success. No rows returned" for each statement

**Step 3 — Create the storage bucket**

Follow [Section 6 — Storage Bucket](#6-storage-bucket) below.

**Step 4 — Configure auth**

Follow [Section 7 — Auth Configuration](#7-auth-configuration) below.

**Step 5 — Copy your API keys**

1. Go to **Settings → API** (left sidebar)
2. Copy:
   - **Project URL** (looks like `https://abcdefgh.supabase.co`)
   - **anon / public** key (the long `eyJ...` string under "Project API keys")
3. These go into `.env.staging` — see [Section 8](#8-environment-files)

---

## 4. Supabase Setup — Production

> Do this once for the production environment. The steps are identical to staging — just use a different project name.

1. Create another Supabase project named `finpro-prod` (same Singapore region)
2. Run the exact same SQL schema in its SQL Editor
3. Create the same storage bucket
4. Configure auth the same way
5. Copy its separate Project URL and anon key into `.env.production`

> **Important:** The staging and production Supabase projects are completely independent. Data entered in staging never appears in production and vice versa.

---

## 5. Database Schema

Run this entire block in the **SQL Editor** of each Supabase project (staging and production separately):

```sql
-- ────────────────────────────────────────────────
-- TABLES
-- ────────────────────────────────────────────────

-- User profiles (auto-created on first login)
CREATE TABLE public.profiles (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  role      text DEFAULT 'Credit Analyst',
  created_at timestamptz DEFAULT now()
);

-- One row per credit-assessment session
CREATE TABLE public.assessments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_type text CHECK (customer_type IN ('company', 'individual')),
  status        text DEFAULT 'draft' CHECK (status IN ('draft', 'complete')),
  final_score   int,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- One row per uploaded document per assessment
CREATE TABLE public.documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id   uuid REFERENCES public.assessments(id) ON DELETE CASCADE,
  doc_type        text,   -- 'kyc', 'biz', 'fin', 'bank', 'prop', 'other', 'salary', 'form16', 'itr'
  file_name       text,
  storage_path    text,   -- path inside the 'documents' bucket: {user_id}/{assessment_id}/{doc_type}/{filename}
  extracted_data  jsonb,  -- key-value pairs read from the document
  uploaded_at     timestamptz DEFAULT now()
);

-- ────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ────────────────────────────────────────────────

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents   ENABLE ROW LEVEL SECURITY;

-- Each user can only read and write their own profile
CREATE POLICY "own profile" ON public.profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Each user can only see their own assessments
CREATE POLICY "own assessments" ON public.assessments
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Each user can only see documents linked to their own assessments
CREATE POLICY "own documents" ON public.documents
  USING (
    assessment_id IN (
      SELECT id FROM public.assessments WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    assessment_id IN (
      SELECT id FROM public.assessments WHERE user_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON FIRST SIGN-IN
-- ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 6. Storage Bucket

Do this in each Supabase project (staging and production):

**Step 1 — Create the bucket**

1. Go to **Storage** (left sidebar)
2. Click **New bucket**
3. Name: `documents`
4. Toggle **Public bucket** to **OFF** (private)
5. Click **Save**

**Step 2 — Add the storage policy**

1. Click the `documents` bucket
2. Go to **Policies** tab
3. Click **New policy** → **For full customization**
4. Set:
   - Policy name: `users can manage own files`
   - Allowed operation: check all four — SELECT, INSERT, UPDATE, DELETE
   - Target roles: `authenticated`
   - USING expression:
     ```sql
     (storage.foldername(name))[1] = auth.uid()::text
     ```
   - WITH CHECK expression:
     ```sql
     (storage.foldername(name))[1] = auth.uid()::text
     ```
5. Click **Save policy**

This ensures each user can only access files inside their own `{user_id}/` folder.

---

## 7. Auth Configuration

Do this in each Supabase project (staging and production):

**Step 1 — Enable email OTP**

1. Go to **Authentication → Providers** (left sidebar)
2. Confirm **Email** provider is enabled (it is by default)
3. Scroll down to **Email OTP** and make sure it is enabled

**Step 2 — Set the site URL**

1. Go to **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL:
   - Staging: `https://finpro-staging.vercel.app` (or your actual Vercel staging URL)
   - Production: `https://finpro.vercel.app` (or your actual Vercel production URL)
3. Under **Redirect URLs**, add the same URL
4. Click **Save**

> The site URL tells Supabase where to redirect after magic-link clicks and is required for OTP to work correctly in production.

**Step 3 — Adjust OTP expiry (optional)**

1. Go to **Authentication → Email Templates**
2. The default OTP expiry is 1 hour — you can reduce it to 10 minutes for better security:
   - Go to **Authentication → Settings**
   - Set **OTP Expiry** to `600` seconds (10 minutes)

---

## 8. Environment Files

The project uses two environment files — one per environment. Both are **gitignored** and must be created manually on each machine.

**Create `.env.staging`** in the project root:

```env
VITE_ENV=staging
VITE_SUPABASE_URL=https://your-staging-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-staging-anon-key-here
```

**Create `.env.production`** in the project root:

```env
VITE_ENV=production
VITE_SUPABASE_URL=https://your-production-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key-here
```

Replace the placeholder values with the actual URL and anon key copied from each Supabase project's **Settings → API** page.

> `.env.example` in the repo shows the required variable names without real values — use it as a reference template.

---

## 9. Running Locally (Dev / Staging)

Local development always points at the **staging** Supabase project.

**Step 1 — Install dependencies** (first time only)

```bash
npm install
```

**Step 2 — Ensure `.env.staging` exists** with your staging Supabase keys (see Section 8).

**Step 3 — Start the dev server**

```bash
npm run dev
```

The app opens at `http://localhost:5173`.

A yellow **STAGING** badge appears in the top bar to confirm you are connected to the staging environment.

**Step 4 — Test the login flow**

1. Enter your email address in the login field
2. Select customer type (Company or Individual)
3. Click **Send OTP**
4. Check your inbox for a 6-digit code from Supabase
5. Enter the code and click **Sign in**
6. You should land on the Upload screen

**Step 5 — Verify data in Supabase**

After logging in, check your staging Supabase project:
- **Authentication → Users** — your email should appear
- **Table Editor → profiles** — your profile row should exist
- After uploading a document: **Table Editor → assessments** and **documents** — rows appear
- **Storage → documents** — the uploaded file should be visible

---

## 10. Testing a Staging Build Locally

To test the exact build that will be deployed to Vercel staging (not the dev server):

```bash
# Build using staging environment
npm run build:staging

# Serve the built files locally
npm run preview:staging
```

The app is served at `http://localhost:4173`. This is the compiled production-quality bundle pointed at staging Supabase.

---

## 11. Deploying to Vercel — Staging

**Step 1 — Push the `staging` branch to GitHub**

```bash
git checkout -b staging
git push -u origin staging
```

**Step 2 — Create a Vercel project**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import the `finpro` GitHub repository
4. Leave all settings at default (Vercel detects Vite automatically)
5. Click **Deploy**

**Step 3 — Set environment variables for Preview (staging)**

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add these three variables and set their **Environment** to **Preview** only:

   | Variable | Value |
   |---|---|
   | `VITE_ENV` | `staging` |
   | `VITE_SUPABASE_URL` | Your staging Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your staging Supabase anon key |

3. Click **Save**

**Step 4 — Redeploy**

1. Go to **Deployments** tab
2. Find the latest deployment, click the three dots **···**
3. Click **Redeploy** (so it picks up the new env vars)

**Step 5 — Get your staging URL**

Vercel gives the `staging` branch a URL like:
`https://finpro-git-staging-anksing231190.vercel.app`

Every push to the `staging` branch automatically triggers a new deployment to this URL.

---

## 12. Deploying to Vercel — Production

**Step 1 — Push the `main` branch to GitHub**

```bash
git checkout main
# merge staging into main only after testing is complete
git merge staging
git push origin main
```

**Step 2 — Set environment variables for Production**

1. In your Vercel project, go to **Settings → Environment Variables**
2. Add these three variables and set their **Environment** to **Production** only:

   | Variable | Value |
   |---|---|
   | `VITE_ENV` | `production` |
   | `VITE_SUPABASE_URL` | Your **production** Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your **production** Supabase anon key |

3. Click **Save**

**Step 3 — Set the production domain**

1. Go to **Settings → Domains**
2. Add your custom domain (e.g. `apexcredit.yourdomain.com`) or use the default Vercel domain
3. Update the **Site URL** in your production Supabase project to match this domain (Authentication → URL Configuration)

**Step 4 — Redeploy from main**

Push any change to `main` or manually redeploy. Every push to `main` auto-deploys to production.

> The production STAGING badge is **not shown** — the yellow pill only appears when `VITE_ENV=staging`.

---

## 13. Git Branching Strategy

```
main      ← production (live users)
staging   ← testing environment (matches what will go to prod)
feature/* ← individual feature branches, merged into staging first
```

**Workflow for a new change:**

```bash
# 1. Create a feature branch from staging
git checkout staging
git pull origin staging
git checkout -b feature/my-change

# 2. Make changes, commit
git add .
git commit -m "describe the change"

# 3. Push and merge into staging
git push origin feature/my-change
# Open a Pull Request on GitHub: feature/my-change → staging
# Merge after review → auto-deploys to Vercel staging URL

# 4. Test on staging URL

# 5. When ready for production, merge staging → main
git checkout main
git merge staging
git push origin main
# Auto-deploys to Vercel production
```

---

## 14. npm Scripts Reference

| Command | What it does |
|---|---|
| `npm install` | Install all dependencies (run once after cloning) |
| `npm run dev` | Start local dev server → points at staging Supabase |
| `npm run build:staging` | Build for staging (reads `.env.staging`) |
| `npm run build:prod` | Build for production (reads `.env.production`) |
| `npm run build` | Same as `build:prod` — used by Vercel |
| `npm run preview:staging` | Serve the staging build locally at port 4173 |
| `npm run preview:prod` | Serve the production build locally at port 4173 |

---

## 15. Optional: SMS OTP (Indian Mobiles)

By default the app only supports **email OTP**. To enable SMS OTP for 10-digit Indian mobile numbers:

**Step 1 — Sign up with Fast2SMS**

1. Go to [fast2sms.com](https://fast2sms.com) and create an account
2. Complete KYC verification
3. Go to **Dev API** in your dashboard and copy the API key
4. You get free trial credits (~₹50) to start

**Step 2 — Configure in Supabase (do this for each project)**

1. Go to **Authentication → Providers → Phone**
2. Enable Phone provider
3. Set **SMS Provider** to `Twilio` (Fast2SMS has a Twilio-compatible API)
4. Fill in:
   - **Account SID**: `any-string` (Fast2SMS ignores this)
   - **Auth Token**: your Fast2SMS API key
   - **Message Service SID**: `any-string`
   - **Twilio API URL**: `https://www.fast2sms.com/dev/bulkV2`
5. Save

**Step 3 — Remove the SMS guard in code**

In [src/features/auth/login.js](src/features/auth/login.js), find and remove these lines:

```js
if (isMobile) {
  showLoginErr('SMS OTP coming soon — please use your email address for now.');
  return;
}
```

After removing those lines, `sendOtp()` will call `supabase.auth.signInWithOtp({ phone: '+91' + val })` for mobile numbers automatically.

---

## 16. Optional: Custom SMTP for High Volume Email

Supabase's built-in SMTP is limited to **3 emails per hour** on the free tier. For more users, connect a free SMTP provider:

**Using Resend (free — 3,000 emails/month)**

1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain
3. Go to **API Keys** and create a key
4. In Supabase → **Settings → Authentication → SMTP Settings**:
   - Enable custom SMTP
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: your Resend API key
   - Sender email: `noreply@yourdomain.com`
5. Save and test

Do this for both the staging and production Supabase projects.

---

## 17. Environment Variable Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_ENV` | Yes | `staging` or `production` — controls the STAGING badge visibility |
| `VITE_SUPABASE_URL` | Yes | Supabase project URL from Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase public anon key from Settings → API |

**Where each variable is set:**

| Context | Where to set |
|---|---|
| Local dev | `.env.staging` file in project root (gitignored) |
| Local prod build test | `.env.production` file in project root (gitignored) |
| Vercel staging deploys | Vercel dashboard → Environment Variables → Preview |
| Vercel production deploys | Vercel dashboard → Environment Variables → Production |

> The anon key is safe to expose in the browser bundle. It is designed to be public. Security is enforced by Supabase Row-Level Security policies, not by keeping the key secret.

---

## Project Structure

```
finpro/
├── src/
│   ├── main.js                         Entry point, session restore on load
│   ├── lib/
│   │   └── supabase.js                 Supabase client + ENV export
│   ├── config/
│   │   └── docs.js                     Document types and mock field data
│   ├── core/
│   │   ├── state.js                    Global app state
│   │   ├── navigation.js               Screen switching
│   │   ├── toast.js                    Notification system
│   │   └── theme.js                    Dark / light mode
│   ├── features/
│   │   ├── auth/login.js               OTP login flow (sendOtp, verifyOtp)
│   │   ├── layout/topbar.js            Top bar, logout, profile display
│   │   ├── upload/upload.js            Document upload + Supabase Storage
│   │   ├── review/form.js              CAM review form with AI autofill
│   │   └── assessment/assessment.js    Credit score gauge and breakdown
│   ├── styles/                         CSS modules per feature
│   └── utils/ui.js                     Shared UI helpers
├── index.html                          Single-page app shell
├── .env.example                        Template for env vars (committed)
├── .env.staging                        Staging keys — DO NOT COMMIT
├── .env.production                     Production keys — DO NOT COMMIT
├── vercel.json                         Vercel build config
├── vite.config.js                      Vite build config
└── package.json                        Scripts and dependencies
```
