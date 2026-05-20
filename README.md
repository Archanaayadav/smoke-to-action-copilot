# Smoke-to-Action Copilot

Smoke-to-Action Copilot is an interview-ready Next.js prototype that turns public customer review data into prioritized actions for Product, Support, App Engineering, and Operations teams.

## Project Goal

The prototype shows how a cross-functional SharkNinja-style team could move from noisy review text to accountable decisions:

- find early smoke signals
- separate severity from frequency
- map likely owners
- recommend next actions
- generate a concise executive brief

## Why This Problem Was Chosen

Public reviews are messy, emotional, and operationally useful. They often contain early warning signs before a formal analytics dashboard shows a trend: a setup loop, a confusing support path, a safety concern, a firmware update that quietly breaks trust.

That makes the problem ideal for an AI decision copilot. The value is not summarizing reviews for its own sake. The value is helping a team decide what to do next while the signal is still fresh.

## How It Aligns With Fast Action

The app is designed around action velocity:

- PMs can see which issues deserve discovery or sprint attention.
- Support can see what needs a playbook, escalation path, or clearer customer messaging.
- App Engineering can see where app version, pairing, login, firmware, or notification patterns suggest a technical owner.
- Leaders can get a memo-style brief without waiting for a manual synthesis pass.

## Why This Is Not A Dashboard

This app is not a passive reporting surface. It does not lead with charts, filters, or historical metrics. The main interaction is a decision prompt, and the output is an action-oriented readout.

It is also not a generic chatbot. The model returns a typed structured object using the Vercel AI SDK, and the frontend renders that object into purpose-built React sections. Only one small sanitized HTML fragment is rendered for the executive brief card.

The mode selector also changes the decision lens:

- `PM Brief` emphasizes prioritization, root cause hypotheses, and roadmap tradeoffs.
- `Support Brief` emphasizes escalation, playbooks, and customer-facing next steps.
- `Executive Brief` emphasizes risk, urgency, ownership, and crisp decisions.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Vercel AI SDK
- OpenAI provider for generation
- Local CSV file in `data/reviews.csv`
- No database, auth, or vector store in v1

## Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Run locally:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy To Vercel

1. Push this project to GitHub.
2. Import the repository in Vercel.
3. Add `OPENAI_API_KEY` in Vercel Project Settings.
4. Optionally add `OPENAI_MODEL`.
5. Deploy.

The app reads the CSV from the local `data` directory at runtime, so no database setup is required.

## How Retrieval Works

The v1 retrieval layer uses:

- keyword matching over review titles, text, product names, categories, source, region, and app version
- metadata-aware filtering for product/category matches
- simple relevance scoring with boosts for low ratings, recent app version, and severe language

The retrieval function includes a comment showing where embeddings or vector retrieval could be blended in later.

## How To Explain This In An Interview

Use this framing:

> I built this as a decision copilot, not a dashboard. The model does not generate the whole UI. It returns a schema-constrained object, and the product renders that object into stable sections for executives and operators. That makes the experience more trustworthy, easier to test, and easier to extend into production workflows.

Important implementation points:

- Structured output is the source of truth.
- The UI encodes the product opinion: severity, frequency, evidence strength, uncertainty, ownership, action, and validation.
- The executive brief is intentionally limited to a sanitized HTML fragment.
- Retrieval is lightweight for v1, but the boundary is ready for embeddings and richer metadata.

## Tradeoffs Made For V1

- Local CSV instead of a database keeps the prototype easy to run and interview-friendly.
- Keyword and metadata retrieval is transparent, but it will miss some semantic matches that embeddings would catch.
- No auth or workspace model, because the goal is to prove the decision workflow first.
- The HTML brief is intentionally constrained and sanitized so structured React components remain the primary UI.
- Confidence is evidence-based and directional, not a statistical measure.

## Possible Production Improvements

- Add embeddings for semantic retrieval and clustering.
- Store ingested reviews in a database with normalized products and sources.
- Add review upload with schema validation and preview.
- Add owner taxonomies and routing rules.
- Add human feedback on issue grouping and ownership confidence.
- Add export to Slack, Jira, Linear, or a weekly executive memo.
- Add regression tracking for issues across product releases and app versions.
- Add trend detection across time, app versions, and product cohorts.
- Add issue deduplication and workflow handoff into Jira or Linear.

## Demo Prompts

- What are the top smoke signals in these reviews?
- Which issues are severe but not yet frequent?
- What should Support vs App Engineering own?
