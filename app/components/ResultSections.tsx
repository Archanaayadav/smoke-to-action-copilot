"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/app/components/Badge";
import { MarkdownText } from "@/app/components/MarkdownText";
import type { CopilotResult } from "@/lib/types";

const urgencyTone = {
  low: "low",
  medium: "medium",
  high: "high"
} as const;

const tabs = ["App Reviews", "Retail Reviews", "Support Feedback"] as const;
type EvidenceTab = (typeof tabs)[number];

function findOwner(result: CopilotResult, issueTitle: string) {
  return result.owners.find((owner) => owner.issue_title === issueTitle);
}

function findAction(result: CopilotResult, issueTitle: string) {
  return result.actions.find((action) => action.issue_title === issueTitle);
}

function impactFor(issue: CopilotResult["issues"][number]) {
  if (issue.severity === "critical" || issue.severity === "high") {
    return "High customer risk. Needs a clear owner and fast follow-up.";
  }

  if (issue.frequency >= 3) {
    return "Repeated friction. Likely to create support volume or returns.";
  }

  return "Early signal. Watch closely and validate before it grows.";
}

function tabForSource(source: string): EvidenceTab {
  if (/app store|google play/i.test(source)) return "App Reviews";
  if (/support|ticket|call|chat/i.test(source)) return "Support Feedback";
  return "Retail Reviews";
}

export function ResultSections({ result }: { result: CopilotResult }) {
  const [activeTab, setActiveTab] = useState<EvidenceTab>("App Reviews");
  const topIssues = result.issues.slice(0, 3);
  const topActions = result.actions.slice(0, 4);

  const quotesByTab = useMemo(() => {
    return tabs.reduce<Record<EvidenceTab, typeof result.quotes>>((groups, tab) => {
      groups[tab] = result.quotes.filter((quote) => tabForSource(quote.source) === tab).slice(0, 3);
      return groups;
    }, {
      "App Reviews": [],
      "Retail Reviews": [],
      "Support Feedback": []
    });
  }, [result.quotes]);

  return (
    <section className="space-y-8">
      <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-teal-100">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Summary</p>
        <div className="mt-3 max-w-3xl">
          <MarkdownText text={result.summary_markdown} />
        </div>
      </div>

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Priority</p>
          <h2 className="mt-1 text-2xl font-black text-stone-950">What Needs Attention Right Now</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            The highest-value items for the team to inspect, assign, and move forward.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {topIssues.map((issue) => {
            const owner = findOwner(result, issue.title);
            const action = findAction(result, issue.title);

            return (
              <article key={issue.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
                <div className="mb-4 h-1.5 w-14 rounded-full bg-teal-700" />
                <h3 className="text-lg font-black leading-6 text-stone-950">{issue.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-700">{issue.why_it_matters}</p>

                <div className="mt-5 space-y-3 border-t border-stone-200 pt-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">Impact</p>
                    <p className="mt-1 text-sm leading-6 text-stone-800">{impactFor(issue)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">Owner</p>
                    <p className="mt-1 text-sm font-bold text-stone-950">{owner?.likely_owner ?? "Product"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">Next step</p>
                    <p className="mt-1 text-sm leading-6 text-stone-800">
                      {action?.recommended_action ?? "Assign an owner and validate the issue with recent reviews."}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Examples</p>
              <h2 className="mt-1 text-xl font-black text-stone-950">Customer Examples</h2>
            </div>
            <div className="flex rounded-lg bg-teal-50 p-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                    activeTab === tab ? "bg-white text-teal-800 shadow-sm" : "text-stone-600 hover:text-teal-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {quotesByTab[activeTab].length > 0 ? (
              quotesByTab[activeTab].map((quote) => (
                <blockquote key={`${quote.source}-${quote.quote}`} className="rounded-lg border-l-4 border-teal-700 bg-teal-50/60 p-4">
                  <p className="text-sm leading-6 text-stone-800">&quot;{quote.quote}&quot;</p>
                </blockquote>
              ))
            ) : (
              <p className="rounded-lg bg-stone-50 p-4 text-sm text-stone-600">
                No examples from this channel in the current sample.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Owners</p>
          <h2 className="mt-1 text-xl font-black text-stone-950">Recommended Owners</h2>

          <div className="mt-5 overflow-hidden rounded-lg border border-stone-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-teal-800 text-xs uppercase tracking-[0.12em] text-white">
                <tr>
                  <th className="p-3">Issue</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Why</th>
                </tr>
              </thead>
              <tbody>
                {result.owners.slice(0, 5).map((owner) => (
                  <tr key={`${owner.issue_title}-${owner.likely_owner}`} className="border-t border-stone-200 align-top odd:bg-white even:bg-teal-50/40">
                    <td className="p-3 font-semibold text-stone-950">{owner.issue_title}</td>
                    <td className="p-3 font-bold text-teal-800">{owner.likely_owner}</td>
                    <td className="p-3 text-stone-700">{owner.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-teal-900 p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-200">Monday morning plan</p>
            <h2 className="mt-1 text-2xl font-black">Recommended Next Steps</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-teal-50">
            The actions below are the fastest path from feedback to ownership.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {topActions.map((action) => (
            <article key={`${action.issue_title}-${action.recommended_action}`} className="rounded-lg bg-white p-4 text-stone-950 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-black">{action.issue_title}</h3>
                <Badge tone={urgencyTone[action.urgency]}>{action.urgency}</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-stone-700">{action.recommended_action}</p>
              {result.follow_up_questions[0] ? (
                <p className="mt-3 border-t border-stone-200 pt-3 text-xs leading-5 text-stone-500">
                  Validate: {result.follow_up_questions[0]}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-[#fbfaf6] p-6 shadow-sm ring-1 ring-teal-100">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-teal-700">Leadership</p>
        <h2 className="mt-1 text-xl font-black text-stone-950">Leadership Summary</h2>
        <div
          className="brief-fragment mt-5 rounded-lg border border-teal-100 bg-white p-5"
          dangerouslySetInnerHTML={{ __html: result.html_brief }}
        />
      </section>
    </section>
  );
}
