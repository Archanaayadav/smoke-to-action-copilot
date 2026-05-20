"use client";

import { useState } from "react";
import { MarkdownText } from "@/app/components/MarkdownText";
import { ResultSections } from "@/app/components/ResultSections";
import type { CopilotResult } from "@/lib/types";

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

export function CopilotWorkspace() {
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
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="border-b border-stone-200 pb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">SharkNinja</p>
          <h1 className="mt-2 text-2xl font-black text-stone-950 sm:text-3xl">Customer Feedback Priorities</h1>
        </div>
      </nav>

      <section className="grid items-start gap-7 py-10 lg:grid-cols-[1.22fr_1fr]">
        <div className="rounded-2xl border border-teal-100 bg-white/80 p-7 shadow-sm">
          <h2 className="max-w-2xl text-4xl font-black leading-[1.05] text-stone-950 sm:text-5xl">
            Customer Feedback Priorities
          </h2>
          <p className="mt-4 max-w-xl text-lg leading-8 text-stone-700">
            Turn customer feedback into clear product and support priorities.
          </p>

          <div className="mt-8 border-t border-stone-200 pt-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Current priorities</p>
            {result ? (
              <div className="mt-3 max-w-2xl text-base leading-8 text-stone-800">
                <p className="mb-3 text-xl font-black leading-7 text-stone-950">
                  {result.issues.slice(0, 3).length} customer issues require immediate attention.
                </p>
                <MarkdownText text={result.summary_markdown} />
              </div>
            ) : (
              <div className="mt-3 max-w-2xl space-y-4 text-base leading-8 text-stone-700">
                <h3 className="text-xl font-black leading-7 text-stone-950">
                  Identify the issues most likely to affect reliability, support load, and customer trust.
                </h3>
                <p>
                  The review set includes signals across app reliability, connected-product setup, and product quality.
                </p>
                <p>
                  Use the brief to decide what needs attention first, then move into ownership and next steps.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm font-bold text-teal-800">View for:</p>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {modes.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => setMode(item.label)}
                className={`rounded-lg border p-2.5 text-left transition ${
                  mode === item.label
                    ? "border-teal-700 bg-teal-800 text-white"
                    : "border-stone-200 bg-white text-stone-800 hover:border-teal-400 hover:bg-teal-50"
                }`}
              >
                <span className="block text-sm font-black">{item.label}</span>
                <span className={`mt-1 block text-xs leading-5 ${mode === item.label ? "text-teal-50" : "text-stone-600"}`}>
                  {item.helper}
                </span>
              </button>
            ))}
          </div>

          <p className="mt-4 text-sm font-bold text-teal-800">Common questions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setPrompt(suggestion)}
                className="rounded-full border border-stone-300 bg-white px-3 py-2 text-left text-sm font-semibold text-stone-800 transition hover:border-teal-600 hover:bg-teal-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-4">
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
            {isLoading ? "Reviewing feedback..." : "Generate brief"}
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
          <h2 className="mt-2 text-2xl font-black text-stone-950">Ask what needs attention right now.</h2>
        </section>
      )}
    </main>
  );
}
