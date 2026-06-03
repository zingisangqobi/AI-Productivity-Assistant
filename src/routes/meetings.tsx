import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ResultPanel } from "@/components/result-panel";
import { summarizeMeeting } from "@/lib/ai.functions";
import { pushItem } from "@/lib/local-store";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Summarizer — Aria" },
      { name: "description", content: "Turn meeting transcripts into actionable summaries." },
    ],
  }),
  component: MeetingPage,
});

function MeetingPage() {
  const run = useServerFn(summarizeMeeting);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    if (transcript.length < 10) {
      toast.error("Paste a meeting transcript first");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { text } = await run({ data: { title, transcript } });
      setOutput(text);
      pushItem("meetings", { id: crypto.randomUUID(), createdAt: Date.now(), title });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Summarization failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-10">
        <PageHeader
          icon={<FileText className="h-5 w-5" />}
          title="Meeting Notes Summarizer"
          description="Drop the transcript — get an executive summary, decisions, and action items."
        />
        <Card className="p-6 shadow-soft">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Meeting title</Label>
              <Input id="title" placeholder="Q4 Planning Sync" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t">Transcript</Label>
              <Textarea id="t" rows={12} placeholder="Paste raw notes or transcript here…" value={transcript} onChange={(e) => setTranscript(e.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={go} disabled={loading} className="gradient-primary text-primary-foreground shadow-glow">
              {loading ? "Summarizing…" : "Summarize Meeting"}
            </Button>
          </div>
        </Card>
        <ResultPanel value={output} onChange={setOutput} onRegenerate={go} loading={loading} filename="meeting-summary.md" />
      </div>
    </AppShell>
  );
}
