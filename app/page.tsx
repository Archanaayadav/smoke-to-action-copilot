import { CopilotWorkspace } from "@/app/components/CopilotWorkspace";
import { loadReviews } from "@/lib/reviews";

export default async function Home() {
  const reviews = await loadReviews();
  const latestReviewDate = reviews
    .map((review) => review.review_date)
    .sort()
    .at(-1);

  return (
    <CopilotWorkspace
      datasetStats={{
        totalReviews: reviews.length,
        sources: Array.from(new Set(reviews.map((review) => review.source))).sort(),
        categories: Array.from(new Set(reviews.map((review) => review.product_category))).sort(),
        latestReviewDate: latestReviewDate ?? "n/a"
      }}
    />
  );
}
