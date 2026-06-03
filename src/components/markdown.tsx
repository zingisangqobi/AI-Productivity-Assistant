import ReactMarkdown from "react-markdown";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight prose-p:leading-relaxed prose-li:my-0.5">
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
}
