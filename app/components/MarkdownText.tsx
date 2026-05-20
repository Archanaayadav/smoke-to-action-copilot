export function MarkdownText({ text }: { text: string }) {
  return (
    <div className="space-y-3 text-sm leading-7 text-stone-700">
      {text.split(/\n{2,}/).map((block) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={trimmed} className="text-base font-bold text-stone-950">
              {trimmed.replace(/^###\s+/, "")}
            </h3>
          );
        }

        if (trimmed.startsWith("- ")) {
          return (
            <ul key={trimmed} className="list-disc space-y-1 pl-5">
              {trimmed.split("\n").map((line) => (
                <li key={line}>{line.replace(/^-\s+/, "")}</li>
              ))}
            </ul>
          );
        }

        return <p key={trimmed}>{trimmed.replace(/\*\*/g, "")}</p>;
      })}
    </div>
  );
}
