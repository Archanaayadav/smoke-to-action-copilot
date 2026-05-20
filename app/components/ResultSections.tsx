import { Badge } from "@/app/components/Badge";
import { MarkdownText } from "@/app/components/MarkdownText";
import type { CopilotResult } from "@/lib/types";

const severityTone = {
  low: "low",
  medium: "medium",
  high: "high",
  critical: "critical"
} as const;

const urgencyTone = {
  low: "low",
  medium: "medium",
  high: "high"
} as const;

const evidenceTone = {
  weak: "weak",
  moderate: "moderate",
  strong: "strong"
} as const;

export function ResultSections({ result }: { result: CopilotResult }) {
  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-stone-200 bg-white/95 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Executive Summary</p>
            <h2 className="mt-1 text-2xl font-black text-stone-950">Decision readout</h2>
          </div>
          <Badge tone="success">Structured output</Badge>
        </div>
        <MarkdownText text={result.summary_markdown} />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Top Smoke Signals</p>
            <h2 className="mt-1 text-xl font-black text-stone-950">Prioritized by urgency, not volume alone</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-stone-600">
            Frequency is shown beside severity so rare but risky complaints do not get buried.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          {result.issues.map((issue) => (
            <article key={issue.title} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-extrabold text-stone-950">{issue.title}</h3>
                <Badge tone={severityTone[issue.severity]}>{issue.severity}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-stone-950 px-2 py-1 text-xs font-bold text-white">
                  {issue.frequency} refs
                </span>
                <Badge tone={evidenceTone[issue.evidence_strength]}>{issue.evidence_strength} evidence</Badge>
                {issue.likely_systemic ? <Badge tone="critical">systemic risk</Badge> : <Badge>localized</Badge>}
              </div>
              <p className="mt-4 text-sm leading-6 text-stone-700">{issue.why_it_matters}</p>
              <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-stone-500">Uncertainty</p>
                <p className="mt-1 text-xs leading-5 text-stone-700">{issue.uncertainty}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Supporting Evidence</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {result.quotes.map((quote) => (
            <blockquote key={`${quote.issue_title}-${quote.quote}`} className="rounded-md border-l-4 border-teal-600 bg-teal-50/60 p-4">
              <p className="text-sm leading-6 text-stone-800">&quot;{quote.quote}&quot;</p>
              <footer className="mt-3 text-xs font-semibold text-stone-600">
                {quote.product_name} · {quote.source} · {quote.issue_title}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Ownership Mapping</p>
              <h2 className="mt-1 text-xl font-black text-stone-950">Who should move first</h2>
            </div>
            <Badge>confidence shown</Badge>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-stone-950 text-xs uppercase tracking-[0.12em] text-white">
                <tr>
                  <th className="p-3">Issue</th>
                  <th className="p-3">Owner</th>
                  <th className="p-3">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {result.owners.map((owner) => (
                  <tr key={`${owner.issue_title}-${owner.likely_owner}`} className="border-t border-stone-200 align-top odd:bg-white even:bg-stone-50/70">
                    <td className="p-3 font-semibold text-stone-950">{owner.issue_title}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{owner.likely_owner}</div>
                      <p className="mt-1 text-xs leading-5 text-stone-600">{owner.rationale}</p>
                    </td>
                    <td className="p-3">
                      <Badge tone={owner.confidence === "high" ? "success" : owner.confidence}>{owner.confidence}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Recommended Next Actions</p>
          <h2 className="mt-1 text-xl font-black text-stone-950">Action queue</h2>
          <div className="mt-4 space-y-3">
            {result.actions.map((action) => (
              <div key={`${action.issue_title}-${action.recommended_action}`} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-stone-950">{action.issue_title}</h3>
                  <Badge tone={urgencyTone[action.urgency]}>{action.urgency}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-700">{action.recommended_action}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">What To Validate Next</p>
          <h2 className="mt-1 text-xl font-black text-stone-950">Evidence gaps</h2>
          <ul className="mt-4 space-y-3">
            {result.follow_up_questions.map((question) => (
              <li key={question} className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm font-semibold leading-6 text-stone-800">
                {question}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-teal-700/30 bg-[#fdfbf4] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Executive Brief</p>
              <h2 className="mt-1 text-xl font-black text-stone-950">Memo-ready HTML fragment</h2>
            </div>
            <Badge>sanitized HTML</Badge>
          </div>
          <div
            className="brief-fragment rounded-lg border border-stone-300 bg-white p-6 shadow-[inset_0_0_0_1px_rgba(20,83,45,0.04)]"
            dangerouslySetInnerHTML={{ __html: result.html_brief }}
          />
        </div>
      </div>
    </section>
  );
}
