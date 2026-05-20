import type { CopilotResult } from "@/lib/types";

function findOwner(result: CopilotResult, issueTitle: string) {
  return result.owners.find((owner) => owner.issue_title === issueTitle);
}

function findAction(result: CopilotResult, issueTitle: string) {
  return result.actions.find((action) => action.issue_title === issueTitle);
}

function impactFor(issue: CopilotResult["issues"][number]) {
  if (issue.severity === "critical" || issue.severity === "high") {
    return "High customer impact. Needs attention soon.";
  }

  if (issue.frequency >= 3) {
    return "Repeated friction. Likely to increase support volume.";
  }

  return "Early signal. Worth validating before it spreads.";
}

function urgencyStyle(urgency: CopilotResult["actions"][number]["urgency"]) {
  if (urgency === "high") return "bg-emerald-100 text-emerald-900";
  if (urgency === "medium") return "bg-amber-100 text-amber-900";
  return "bg-stone-100 text-stone-700";
}

export function ResultSections({ result }: { result: CopilotResult }) {
  const topIssues = result.issues.slice(0, 3);
  const topActions = result.actions.slice(0, 4);
  const examples = result.quotes.slice(0, 2);

  return (
    <section className="space-y-9">
      <section>
        <div className="mb-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Focus</p>
          <h2 className="mt-1 text-2xl font-black text-stone-950">Top Issues Requiring Attention</h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {topIssues.map((issue) => {
            const action = findAction(result, issue.title);

            return (
              <article key={issue.title} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
                <h3 className="text-lg font-black leading-6 text-stone-950">{issue.title}</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">Why it matters</p>
                    <p className="mt-1 text-sm leading-6 text-stone-700">{issue.why_it_matters}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">Impact</p>
                    <p className="mt-1 text-sm leading-6 text-stone-800">{impactFor(issue)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">Next step</p>
                    <p className="mt-1 text-sm leading-6 text-stone-800">
                      {action?.recommended_action ?? "Assign a clear owner and validate the latest customer reports."}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-teal-700">Teams to loop in</p>
                    <p className="mt-1 text-sm font-semibold text-stone-900">
                      {findOwner(result, issue.title)?.likely_owner ?? "Product"}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-teal-900 p-6 text-white shadow-sm">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">Next</p>
          <h2 className="mt-1 text-3xl font-black">Recommended Next Steps</h2>
          <p className="mt-3 text-sm leading-6 text-teal-50">
            A short action list for the team to pick up this week.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {topActions.map((action) => {
            const owner = findOwner(result, action.issue_title);

            return (
              <article key={`${action.issue_title}-${action.recommended_action}`} className="rounded-xl bg-white p-5 text-stone-950">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-black leading-6">{action.issue_title}</h3>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${urgencyStyle(action.urgency)}`}>
                    {action.urgency}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-700">{action.recommended_action}</p>
                {owner ? <p className="mt-4 text-xs font-semibold text-teal-800">Owner: {owner.likely_owner}</p> : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="max-w-4xl">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">Customers</p>
          <h2 className="mt-1 text-xl font-black text-stone-950">Customer Examples</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            A small sample of customer feedback behind the priorities above.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {examples.map((quote) => (
            <blockquote key={`${quote.source}-${quote.quote}`} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
              <p className="text-sm leading-7 text-stone-800">&quot;{quote.quote}&quot;</p>
            </blockquote>
          ))}
        </div>
      </section>
    </section>
  );
}
