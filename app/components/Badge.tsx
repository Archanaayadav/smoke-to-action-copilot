import clsx from "clsx";

type BadgeProps = {
  children: React.ReactNode;
  tone?: "neutral" | "low" | "medium" | "high" | "critical" | "success" | "weak" | "moderate" | "strong";
};

const tones = {
  neutral: "border-stone-200 bg-white text-stone-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-800",
  medium: "border-amber-200 bg-amber-50 text-amber-800",
  high: "border-orange-200 bg-orange-50 text-orange-800",
  critical: "border-red-200 bg-red-50 text-red-800",
  success: "border-teal-200 bg-teal-50 text-teal-800",
  weak: "border-stone-300 bg-stone-100 text-stone-700",
  moderate: "border-sky-200 bg-sky-50 text-sky-800",
  strong: "border-teal-200 bg-teal-50 text-teal-800"
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={clsx("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
