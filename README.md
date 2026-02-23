# CTC Portfolio

An interactive Next.js portfolio focused on AI engineering patterns, with GPT-based features and Codex-assisted development workflows.

Repository: `https://github.com/christiantcurran-collab/cc`

## What this project includes

- RAG playground with configurable retrieval and generation parameters
- "How AI Works" visual demo showing token probabilities and parameter effects
- Solutions Engineer trainer with documentation, MCQ quiz, and practice feedback
- Insurance dashboard demo for domain-specific AI exploration with persisted portfolio weights
- API routes for query, embedding, mode detection, community features, and insurance portfolio persistence

## Core capabilities

- OpenAI-powered generation and feedback endpoints
- GPT model controls exposed in interactive demos and trainer workflows
- Demo mode fallback when `OPENAI_API_KEY` is not set
- Configurable generation parameters (`model`, `temperature`, `top_p`, `max_tokens`)
- Cached educational outputs for deterministic demos
- Lightweight retrieval pipeline over preprocessed FCA content
- Supabase-backed `community_questions` storage for community tab
- Supabase-backed `insurance_demo_portfolios` storage for insurance holdings and rebalances
- Python-backed fixed income analytics endpoint for insurance bond duration/convexity metrics (executed server-side in backend API route)

## Tech stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui (Radix primitives)
- Backend: Next.js API routes (current), Python backend script execution for insurance analytics (`/api/insurance-metrics`)
- Database: Supabase (Postgres)
- AI: OpenAI SDK + GPT models (currently GPT-4o family in core app APIs, GPT-4.1/GPT-5.x in How-an-LLM-Works model set)
- Hosting: Render (primary), Vercel-compatible

## Architecture at a glance

```text
Browser (Next.js pages/components)
  -> Next.js route handlers (/api/*)
      -> OpenAI API (generation, embeddings, feedback)
      -> Supabase (community questions, insurance portfolio persistence)
      -> Python metrics script (insurance duration/convexity calculations)
  -> Local cached JSON data (demo mode and how-ai-works cache)
```

## Backend Python usage

Yes, Python is used in the backend.

- Route: `POST /api/insurance-metrics`
- Node route handler spawns: `scripts/python/calculate_bond_metrics.py`
- Python computes: cashflows, market price, duration, convexity, PV01/DV01, expected loss
- Returned metrics are then used by the Insurance dashboard UI

### Key architecture flows

1. RAG Playground
- UI sends query/config to `/api/query`.
- Route retrieves local context chunks and optionally calls OpenAI (live mode).
- Response returns answer + source context + metrics.

2. SE Trainer
- Community tab uses Supabase-backed `/api/community` and `/api/community/expand`.
- Practice feedback uses `/api/se-trainer/feedback` with OpenAI scoring.

3. Insurance Dashboard
- Bond set is generated client-side then sent to `/api/insurance-metrics`.
- Python script computes market price, duration, convexity, PV01/DV01, expected loss, cashflows.
- Holdings + rebalance state is persisted via Supabase `/api/insurance-portfolio`.

## Tool system diagrams

### 1) Insurance Dashboard

```text
Insurance UI (Assets / Holdings / Risk / Monte Carlo)
  -> /api/insurance-metrics (Next.js route)
      -> Python script calculate_bond_metrics.py
      -> returns duration/convexity/cashflow metrics
  -> /api/insurance-portfolio (Next.js route)
      -> Supabase table: insurance_demo_portfolios
  -> Risk/MC charts render using weighted holdings + computed metrics
```

### 2) SE Trainer

```text
SE Trainer UI (Docs / Quiz / Practice / Community)
  -> Practice feedback: /api/se-trainer/feedback
      -> OpenAI API scoring + coaching response
  -> Community list/create: /api/community
      -> Supabase table: community_questions
  -> Community expand: /api/community/expand
      -> OpenAI API expanded answer
```

### 3) How an LLM Works

```text
How-AI-Works UI controls (model/temp/top_p/RAG/etc)
  -> local cache lookup in src/data/how-ai-works-cache.json
  -> nearest/exact match from pre-generated combinations
  -> renders token probability bars + generated text + explanation panel
  -> no runtime API call required for parameter exploration
```

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Set environment values in `.env.local`:

- `OPENAI_API_KEY`: required for live mode
- `NEXT_PUBLIC_SUPABASE_URL`: required for Supabase-backed features
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: required for browser-side Supabase calls (community features)
- `SUPABASE_SERVICE_ROLE_KEY`: recommended for server-side insurance portfolio API writes

4. Run development server:

```bash
npm run dev
```

5. Open:

- `http://localhost:3000/how-ai-works`

Prerequisite for insurance analytics:

- Python 3 available in PATH as `python` (used by `/api/insurance-metrics`)

## Available scripts

- `npm run dev`: start dev server
- `npm run build`: production build
- `npm run start`: run production server
- `npm run lint`: run Next.js lint checks

## Main routes

- `/how-ai-works`: interactive LLM parameter visualization
- `/insurance-dashboard`: insurance-focused analytics demo
- `/se-trainer`: solutions engineer practice and quiz experience
- `/playground`: RAG playground experience
- `/about`: project and stack summary

## API endpoints

- `POST /api/query`: retrieve context and generate answer
- `POST /api/embed`: generate/query embeddings in live mode
- `GET /api/mode`: returns `demo` or `live`
- `GET|POST /api/community`: community question list + creation
- `POST /api/community/expand`: expand community question with model answer
- `GET|PUT /api/insurance-portfolio`: load/save insurance demo holdings for `Insurance Company A`
- `POST /api/insurance-metrics`: Python-backed duration/convexity and cashflow calculation for insurance bonds
- `POST /api/se-trainer/feedback`: score and coach practice answers
- `GET /api/ingest`: ingestion capability summary endpoint

## Supabase setup

This project currently uses Supabase for two feature sets:

- `community_questions` table: SE Trainer Community tab
- `insurance_demo_portfolios` table: Insurance holdings and rebalance state

Insurance table setup is provided:

- `scripts/sql/insurance_demo_portfolio.sql`

Community table can be created with:

```sql
create table if not exists public.community_questions (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text not null default 'Contributor',
  ai_answer text null,
  created_at timestamptz not null default now()
);
```

## Repository structure

```text
src/
  app/
    api/
    about/
    how-ai-works/
    insurance-dashboard/
    learn/
    playground/
    se-trainer/
  components/
    config-panel/
    how-ai-works/
    layout/
    results/
    ui/
  data/
  lib/
scripts/
```

## Operational notes

- Without `OPENAI_API_KEY`, the app stays in demo mode and uses local fallback responses.
- Cached data in `src/data/how-ai-works-cache.json` powers deterministic visual demonstrations.
- SE Trainer feedback route requires OpenAI credentials for live scoring.

## Deployment

This app is deployment-ready for Render (or any Node-compatible host).

Render notes:

- Use a Web Service with Node runtime.
- Ensure Python 3 is available in the runtime image for `/api/insurance-metrics`.
- Configure environment variables in Render dashboard.

Recommended environment setup in production:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` (if community/insurance features enabled)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if community features enabled)
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for insurance portfolio API writes)

## License

This repository currently has no explicit license file. Add one if public reuse is intended.
