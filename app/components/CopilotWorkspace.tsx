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
  "What needs immediate attention?",
  "What should Product prioritize?",
  "Which issues are hurting customers most?"
];

const modes = [
  {
    label: "Product",
    helper: "Priorities and tradeoffs"
  },
  {
    label: "Support",
    helper: "Customer response and escalation"
  },
  {
    label: "Leadership",
    helper: "Risk, urgency, and ownership"
  }
] as const;

type BriefMode = (typeof modes)[number]["label"];

export function CopilotWorkspace({ datasetStats }: { datasetStats: DatasetStats }) {
  const [prompt, setPrompt] = useState(suggestions[0]);
  const [mode, setMode] = useState<BriefMode>("Product");
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
          <h1 className="mt-1 text-2xl font-black text-stone-950 sm:text-3xl">Customer Friction Copilot</h1>
        </div>
        <div className="rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-bold text-teal-800">
          {datasetStats.totalReviews} reviews loaded
        </div>
      </nav>

      <section className="grid gap-8 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <div>
            <h2 className="max-w-3xl text-4xl font-black leading-[1.05] text-stone-950 sm:text-5xl">
              Turn messy customer feedback into clear next actions.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-stone-700">
              Turn messy customer feedback into clear next actions for Product, Support, and Engineering.
            </p>
          </div>

          <div className="rounded-lg border border-teal-100 bg-white/95 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Current dataset</p>
                <h3 className="mt-1 text-lg font-black text-stone-950">Customer reviews, app stores, and retail channels</h3>
              </div>
              <span className="rounded-md bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                Local CSV
              </span>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-teal-50/70 p-3">
                <p className="text-xs font-bold text-teal-800">Reviews</p>
                <p className="mt-1 text-sm font-semibold text-stone-800">{datasetStats.totalReviews} rows</p>
              </div>
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
          <p className="text-sm font-bold text-teal-800">View for:</p>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {modes.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setMode(item.label)}
                className={`rounded-lg border p-3 text-left transition ${
                  mode === item.label
                    ? "border-teal-700 bg-teal-800 text-white"
                    : "border-stone-200 bg-stone-50 text-stone-800 hover:border-teal-400 hover:bg-teal-50"
                }`}
              >
                <span className="block text-sm font-black">{item.label}</span>
                <span className={`mt-1 block text-xs leading-5 ${mode === item.label ? "text-teal-50" : "text-stone-600"}`}>
                  {item.helper}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-6 text-sm font-bold text-teal-800">Quick questions</p>
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
            <label htmlFor="prompt" className="text-sm font-bold text-teal-800">
              Ask a team question
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mt-2 min-h-32 w-full resize-none rounded-lg border border-stone-300 bg-white p-4 text-base text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              placeholder="Ask what the team should do next..."
            />
          </div>

          <button
            type="button"
            onClick={() => askCopilot()}
            disabled={isLoading || !prompt.trim()}
            className="mt-4 w-full rounded-lg bg-teal-800 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isLoading ? "Reviewing feedback..." : "Get recommendations"}
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
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-teal-700">Ready</p>
          <h2 className="mt-2 text-2xl font-black text-stone-950">Ask what needs attention and get a Monday-morning action list.</h2>
        </section>
      )}
    </main>
  );
}
