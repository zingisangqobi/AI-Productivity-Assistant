import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResultPanel } from "@/components/result-panel";
import { researchTopic } from "@/lib/ai.functions";
import { pushItem } from "@/lib/local-store";
import { toast } from "sonner";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Research Assistant — Aria" },
      { name: "description", content: "Quickly gather and organize information with AI." },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  const run = useServerFn(researchTopic);
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [format, setFormat] = useState("Executive Briefing");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    if (!topic) {
      toast.error("Enter a research topic");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { text } = await run({ data: { topic, context, format } });
      setOutput(text);
      pushItem("research", { id: crypto.randomUUID(), createdAt: Date.now(), topic });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Research failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-10">
        <PageHeader
          icon={<Search className="h-5 w-5" />}
          title="AI Research Assistant"
          description="Get a structured briefing with findings, evidence, and recommendations."
        />
        <Card className="p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="topic">Research question</Label>
              <Input id="topic" placeholder="How are mid-market SaaS companies adopting AI in 2026?" value={topic} onChange={(e) => setTopic(e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="ctx">Context</Label>
              <Textarea id="ctx" rows={4} placeholder="What do you already know? Who is this for?" value={context} onChange={(e) => setContext(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fmt">Desired format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger id="fmt"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Executive Briefing", "Detailed Report", "Bullet Summary", "Comparison Table"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={go} disabled={loading} className="gradient-primary text-primary-foreground shadow-glow">
              {loading ? "Researching…" : "Run Research"}
            </Button>
          </div>
        </Card>
        <ResultPanel value={output} onChange={setOutput} onRegenerate={go} loading={loading} filename="research.md" />
      </div>
    </AppShell>
  );
}
