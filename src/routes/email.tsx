import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResultPanel } from "@/components/result-panel";
import { generateEmail } from "@/lib/ai.functions";
import { pushItem } from "@/lib/local-store";
import { toast } from "sonner";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Email Generator — Aria" },
      { name: "description", content: "Generate professional emails instantly with AI." },
    ],
  }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Formal", "Persuasive"];

function EmailPage() {
  const run = useServerFn(generateEmail);
  const [recipient, setRecipient] = useState("");
  const [purpose, setPurpose] = useState("");
  const [tone, setTone] = useState("Professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    if (!recipient || !purpose) {
      toast.error("Recipient and purpose are required");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { text } = await run({ data: { recipient, purpose, tone, keyPoints } });
      setOutput(text);
      pushItem("emails", { id: crypto.randomUUID(), createdAt: Date.now(), recipient, purpose });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-10">
        <PageHeader
          icon={<Mail className="h-5 w-5" />}
          title="Smart Email Generator"
          description="Describe what you need — get a polished email with a strong subject line."
        />
        <Card className="p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="recipient">Recipient</Label>
              <Input id="recipient" placeholder="e.g. Marketing team, Jane Doe (CFO)" value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input id="purpose" placeholder="e.g. Follow up on Q3 budget approval" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="kp">Key points</Label>
              <Textarea id="kp" placeholder="- Deadline is Friday&#10;- Need sign-off from finance" rows={5} value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} />
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={go} disabled={loading} className="gradient-primary text-primary-foreground shadow-glow">
              {loading ? "Generating…" : "Generate Email"}
            </Button>
          </div>
        </Card>
        <ResultPanel value={output} onChange={setOutput} onRegenerate={go} loading={loading} filename="email.md" />
      </div>
    </AppShell>
  );
}
