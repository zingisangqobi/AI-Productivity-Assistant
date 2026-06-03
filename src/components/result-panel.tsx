import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import { Copy, RefreshCcw, Pencil, Check, Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ResultPanel({
  value,
  onChange,
  onRegenerate,
  loading,
  filename = "output.md",
}: {
  value: string;
  onChange: (v: string) => void;
  onRegenerate?: () => void;
  loading?: boolean;
  filename?: string;
}) {
  const [editing, setEditing] = useState(false);
  if (!value && !loading) return null;
  return (
    <Card className="p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          AI Output
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditing((e) => !e)}
            disabled={!value}
          >
            {editing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            <span className="ml-1">{editing ? "Done" : "Edit"}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast.success("Copied to clipboard");
            }}
            disabled={!value}
          >
            <Copy className="h-4 w-4" />
            <span className="ml-1">Copy</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const blob = new Blob([value], { type: "text/markdown" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = filename;
              a.click();
              URL.revokeObjectURL(url);
            }}
            disabled={!value}
          >
            <Download className="h-4 w-4" />
            <span className="ml-1">Export</span>
          </Button>
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              disabled={loading}
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="ml-1">Regenerate</span>
            </Button>
          )}
        </div>
      </div>
      {loading && !value ? (
        <div className="space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
        </div>
      ) : editing ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
      ) : (
        <Markdown>{value}</Markdown>
      )}
    </Card>
  );
}
