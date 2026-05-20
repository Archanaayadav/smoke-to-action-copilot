import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";
import { loadReviews, retrieveReviews } from "@/lib/reviews";
import { sanitizeHtmlFragment } from "@/lib/sanitize";
import { copilotSchema } from "@/lib/types";

export const maxDuration = 30;

const modeInstructions = {
  Product:
    "Emphasize product prioritization, defect patterns, severity-vs-frequency tradeoffs, and what the PM should put into discovery or sprint planning first.",
  Support:
    "Emphasize support playbooks, escalation triggers, customer messaging, evidence needed from tickets, and what support can do before engineering fixes ship.",
  Leadership:
    "Emphasize customer risk, business urgency, ownership clarity, crisp decisions, and executive-ready language without implementation detail overload."
} as const;

type BriefMode = keyof typeof modeInstructions;

export async function POST(request: Request) {
  try {
    const { prompt, mode } = (await request.json()) as { prompt?: string; mode?: BriefMode };
    const selectedMode: BriefMode = mode && mode in modeInstructions ? mode : "Product";
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const modelName = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini";

    if (!prompt?.trim()) {
      return NextResponse.json({ error: "Ask a question about the review dataset." }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing OPENAI_API_KEY. Add it to .env.local to run the structured copilot response."
        },
        { status: 500 }
      );
    }

    const reviews = await loadReviews();
    const retrieval = retrieveReviews(prompt, reviews);

    const { object } = await generateObject({
      model: openai(modelName),
      schema: copilotSchema,
      temperature: 0.2,
      system: `You are Customer Friction Copilot for a SharkNinja-style cross-functional team.
Your job is to convert public customer reviews into prioritized product, support, app, and operations actions.

Rules:
- Return only the structured object requested by the schema.
- Use the retrieved reviews as evidence. Do not invent quotes, products, or sources.
- Prefer actionability over analytics narration.
- Distinguish severity from frequency. A low-frequency safety issue may be high or critical severity.
- Prioritize severe-but-low-frequency issues above frequent annoyances when they imply safety, reliability, trust, or return risk.
- Mark likely_systemic true when complaints repeat across products, app versions, sources, or have a plausible shared root cause.
- Map owners specifically: Product, Support, App Engineering, Firmware, Hardware Quality, Operations, Documentation, or Safety/Compliance.
- Set evidence_strength based on number and quality of supporting reviews: strong for repeated specific evidence, moderate for several directional signals, weak for one or ambiguous signal.
- Use uncertainty to name what is not yet proven and what evidence would change the call.
- Keep summary_markdown short: 2 compact paragraphs or 3 bullets maximum.
- Keep every recommendation short, plain, and operational.
- Keep html_brief short, polished, and executive-ready: one memo-style section with a headline, one short paragraph, and 2 to 3 bullets.
- html_brief may only use section, h3, p, ul, li, strong, em, and div tags.
- No scripts, links, inline styles, images, iframes, or external classes in html_brief.`,
      prompt: `User question:
${prompt}

Brief mode:
${selectedMode}

Mode emphasis:
${modeInstructions[selectedMode]}

Dataset context:
- Total reviews in local CSV: ${retrieval.totalReviews}
- Filters applied: ${retrieval.filtersApplied.length ? retrieval.filtersApplied.join(", ") : "none"}

Retrieved review evidence:
${retrieval.selectedReviews
  .map(
    (review) => `Review ${review.review_id}
Source: ${review.source}
Product: ${review.product_name}
Category: ${review.product_category}
Rating: ${review.rating}
Date: ${review.review_date}
App version: ${review.app_version || "n/a"}
Title: ${review.review_title}
Text: ${review.review_text}`
  )
  .join("\n\n")}

Create the structured copilot result for these product sections:
Summary, What Needs Attention Right Now, Customer Examples, Recommended Owners, Recommended Next Steps, Leadership Summary.

Ordering guidance:
1. Lead with the issues that require action first, not merely the most common issues.
2. If a safety or trust signal appears only once or twice, still surface it if severity is high.
3. Ownership should be practical and accountable, not generic.`
    });

    return NextResponse.json({
      ...object,
      html_brief: sanitizeHtmlFragment(object.html_brief)
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "The copilot could not produce a structured response. Try a narrower prompt." },
      { status: 500 }
    );
  }
}
