import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Review } from "@/lib/types";

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

export async function loadReviews(): Promise<Review[]> {
  const file = await readFile(path.join(process.cwd(), "data", "reviews.csv"), "utf8");
  const [headerLine, ...lines] = file.trim().split(/\r?\n/);
  const headers = parseCsvLine(headerLine);

  return lines.map((line) => {
    const values = parseCsvLine(line);
    const row = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));

    return {
      review_id: row.review_id,
      source: row.source,
      product_name: row.product_name,
      review_title: row.review_title,
      review_text: row.review_text,
      rating: Number(row.rating),
      review_date: row.review_date,
      app_version: row.app_version,
      region: row.region,
      product_category: row.product_category
    };
  });
}

const stopWords = new Set([
  "the",
  "and",
  "are",
  "for",
  "what",
  "with",
  "these",
  "this",
  "that",
  "should",
  "first",
  "from",
  "into",
  "review",
  "reviews"
]);

function tokenize(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));
}

export type RetrievalResult = {
  selectedReviews: Review[];
  totalReviews: number;
  filtersApplied: string[];
};

export function retrieveReviews(query: string, reviews: Review[], limit = 14): RetrievalResult {
  const queryTerms = tokenize(query);
  const filtersApplied: string[] = [];
  const lowerQuery = query.toLowerCase();

  const categories = Array.from(new Set(reviews.map((review) => review.product_category)));
  const matchedCategory = categories.find((category) => lowerQuery.includes(category.toLowerCase()));
  const productMatches = reviews.filter((review) =>
    lowerQuery.includes(review.product_name.toLowerCase().split(" ").slice(0, 2).join(" "))
  );

  let candidates = reviews;
  if (matchedCategory) {
    candidates = candidates.filter((review) => review.product_category === matchedCategory);
    filtersApplied.push(`category:${matchedCategory}`);
  } else if (productMatches.length > 0) {
    const productNames = new Set(productMatches.map((review) => review.product_name));
    candidates = candidates.filter((review) => productNames.has(review.product_name));
    filtersApplied.push("product-name match");
  }

  const scored = candidates.map((review) => {
    const searchable = [
      review.source,
      review.product_name,
      review.review_title,
      review.review_text,
      review.product_category,
      review.app_version,
      review.region
    ]
      .join(" ")
      .toLowerCase();

    const keywordScore = queryTerms.reduce((score, term) => {
      return score + (searchable.includes(term) ? 2 : 0);
    }, 0);
    const lowRatingBoost = review.rating <= 2 ? 3 : review.rating === 3 ? 1 : 0;
    const recentAppBoost = review.app_version === "3.8.2" ? 1.5 : 0;
    const severeLanguageBoost = /unsafe|safety|leak|fray|crash|stuck|offline|loop|flaking|hot/i.test(
      review.review_text
    )
      ? 2
      : 0;

    return {
      review,
      score: keywordScore + lowRatingBoost + recentAppBoost + severeLanguageBoost
    };
  });

  const selectedReviews = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ review }) => review);

  // Future production path: add an embedding column or vector store lookup here,
  // then blend semantic similarity with the metadata and severity scoring above.
  return {
    selectedReviews,
    totalReviews: reviews.length,
    filtersApplied
  };
}
