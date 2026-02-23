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
- Python-backed fixed income analytics endpoint for insurance bond duration/convexity metrics

## Tech stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS + shadcn/ui + Radix primitives
- OpenAI Node SDK (`openai`)
- Recharts for visualization

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

This app is deployment-ready for Vercel or any Node-compatible host.

Recommended environment setup in production:

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL` (if community/insurance features enabled)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (if community features enabled)
- `SUPABASE_SERVICE_ROLE_KEY` (recommended for insurance portfolio API writes)

## License

This repository currently has no explicit license file. Add one if public reuse is intended.
