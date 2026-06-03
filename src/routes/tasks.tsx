import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ListChecks } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResultPanel } from "@/components/result-panel";
import { planTasks } from "@/lib/ai.functions";
import { pushItem } from "@/lib/local-store";
import { toast } from "sonner";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Task Planner — Aria" },
      { name: "description", content: "Convert goals into structured work plans." },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const run = useServerFn(planTasks);
  const [goal, setGoal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("High");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function go() {
    if (!goal) {
      toast.error("Describe the goal first");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const { text } = await run({ data: { goal, deadline, priority } });
      setOutput(text);
      pushItem("tasks", { id: crypto.randomUUID(), createdAt: Date.now(), goal });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Planning failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 p-6 lg:p-10">
        <PageHeader
          icon={<ListChecks className="h-5 w-5" />}
          title="AI Task Planner"
          description="Turn a goal into a breakdown, timeline, and effort estimate."
        />
        <Card className="p-6 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="goal">Goal</Label>
              <Input id="goal" placeholder="Launch internal beta of the new analytics dashboard" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dl">Deadline</Label>
              <Input id="dl" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pri">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="pri"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Low", "Medium", "High", "Critical"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <Button onClick={go} disabled={loading} className="gradient-primary text-primary-foreground shadow-glow">
              {loading ? "Planning…" : "Create Plan"}
            </Button>
          </div>
        </Card>
        <ResultPanel value={output} onChange={setOutput} onRegenerate={go} loading={loading} filename="task-plan.md" />
      </div>
    </AppShell>
  );
}
