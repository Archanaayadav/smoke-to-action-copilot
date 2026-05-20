"use client";

import { useState } from "react";
import { ResultSections } from "@/app/components/ResultSections";
import type { CopilotResult } from "@/lib/types";

type DatasetStats = {
  totalReviews: number;
  sources: string[];
  categories: string[];
  latestReviewDate: string;
};

const suggestions = [
  "What are the top smoke signals in these reviews?",
  "What should Product focus on first?",
  "Which issues are severe but not yet frequent?",
  "What should Support vs App Engineering own?",
  "Summarize the biggest setup and connectivity friction points."
];

const modes = [
  {
    label: "PM Brief",
    helper: "Prioritization, root causes, roadmap tradeoffs"
  },
  {
    label: "Support Brief",
    helper: "Escalations, playbooks, customer-facing next steps"
  },
  {
    label: "Executive Brief",
    helper: "Risk, urgency, ownership, decision clarity"
  }
] as const;

type BriefMode = (typeof modes)[number]["label"];

export function CopilotWorkspace({ datasetStats }: { datasetStats: DatasetStats }) {
  const [prompt, setPrompt] = useState(suggestions[0]);
  const [mode, setMode] = useState<BriefMode>("PM Brief");
  const [result, setResult] = useState<CopilotResult | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function askCopilot(nextPrompt = prompt) {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: nextPrompt, mode })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "The copilot could not answer that prompt.");
      }

      setResult(payload);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300/80 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">SharkNinja prototype</p>
          <h1 className="mt-1 text-2xl font-black text-stone-950 sm:text-3xl">Smoke-to-Action Copilot</h1>
        </div>
        <div className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-bold text-stone-700 shadow-sm">
          Review CSV loaded locally
        </div>
      </nav>

      <section className="grid gap-6 py-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <div>
            <h2 className="max-w-3xl text-4xl font-black leading-[1.02] text-stone-950 sm:text-6xl">
              Decide what to fix before it becomes a trend.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
              Ask a prioritization question and get a structured decision readout for Product, Support,
              App Engineering, and Operations. The model supplies analysis; the app owns the interface.
            </p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white/90 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Dataset Status</p>
                <h3 className="mt-1 text-lg font-black text-stone-950">{datasetStats.totalReviews} public-style reviews</h3>
              </div>
              <span className="rounded-md bg-stone-950 px-3 py-1.5 text-xs font-bold text-white">
                {datasetStats.latestReviewDate}
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md bg-stone-100 p-3">
                <p className="text-xs font-bold text-stone-500">Sources</p>
                <p className="mt-1 text-sm font-semibold text-stone-800">{datasetStats.sources.join(", ")}</p>
              </div>
              <div className="rounded-md bg-stone-100 p-3">
                <p className="text-xs font-bold text-stone-500">Categories</p>
                <p className="mt-1 text-sm font-semibold text-stone-800">{datasetStats.categories.slice(0, 5).join(", ")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Decision Mode</p>
              <h2 className="mt-1 text-2xl font-black text-stone-950">Shape the readout</h2>
            </div>
            <span className="rounded-md border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
              {mode}
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-3">
            {modes.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setMode(item.label)}
                className={`rounded-lg border p-3 text-left transition ${
                  mode === item.label
                    ? "border-teal-700 bg-teal-50 shadow-sm"
                    : "border-stone-200 bg-stone-50 hover:border-teal-400"
                }`}
              >
                <span className="block text-sm font-black text-stone-950">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-stone-600">{item.helper}</span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Prompt Suggestions</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-left text-sm font-semibold text-stone-800 transition hover:border-teal-600 hover:bg-teal-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label htmlFor="prompt" className="text-sm font-bold text-stone-950">
              Ask for a decision readout
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mt-2 min-h-32 w-full resize-none rounded-lg border border-stone-300 bg-white p-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              placeholder="Ask which issues need action first..."
            />
          </div>

          <button
            type="button"
            onClick={() => askCopilot()}
            disabled={isLoading || !prompt.trim()}
            className="mt-4 w-full rounded-lg bg-stone-950 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isLoading ? `Building ${mode.toLowerCase()}...` : "Generate action brief"}
          </button>

          {error ? (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-800">
              {error}
            </div>
          ) : null}
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="h-4 w-48 animate-pulse rounded bg-stone-200" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-36 animate-pulse rounded-lg bg-stone-100" />
            ))}
          </div>
        </section>
      ) : result ? (
        <ResultSections result={result} />
      ) : (
        <section className="rounded-lg border border-dashed border-stone-300 bg-white/60 p-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Ready when you are</p>
          <h2 className="mt-2 text-2xl font-black text-stone-950">Ask a smoke-signal question to generate the first action brief.</h2>
        </section>
      )}
    </main>
  );
}
