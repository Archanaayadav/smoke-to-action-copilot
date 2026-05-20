import { z } from "zod";

export type Review = {
  review_id: string;
  source: string;
  product_name: string;
  review_title: string;
  review_text: string;
  rating: number;
  review_date: string;
  app_version: string;
  region: string;
  product_category: string;
};

export const copilotSchema = z.object({
  summary_markdown: z.string(),
  issues: z.array(
    z.object({
      title: z.string(),
      severity: z.enum(["low", "medium", "high", "critical"]),
      frequency: z.number(),
      why_it_matters: z.string(),
      likely_systemic: z.boolean(),
      evidence_strength: z.enum(["weak", "moderate", "strong"]),
      uncertainty: z.string()
    })
  ),
  quotes: z.array(
    z.object({
      issue_title: z.string(),
      quote: z.string(),
      source: z.string(),
      product_name: z.string()
    })
  ),
  owners: z.array(
    z.object({
      issue_title: z.string(),
      likely_owner: z.string(),
      rationale: z.string(),
      confidence: z.enum(["low", "medium", "high"])
    })
  ),
  actions: z.array(
    z.object({
      issue_title: z.string(),
      recommended_action: z.string(),
      urgency: z.enum(["low", "medium", "high"])
    })
  ),
  follow_up_questions: z.array(z.string()),
  html_brief: z.string()
});

export type CopilotResult = z.infer<typeof copilotSchema>;
