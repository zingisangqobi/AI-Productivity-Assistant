import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessageSquare,
  ArrowRight,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getCount } from "@/lib/local-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Aria AI Workplace" },
      { name: "description", content: "Your AI workplace command center: emails, meetings, tasks, research, and chat." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [counts, setCounts] = useState({ emails: 0, meetings: 0, tasks: 0, research: 0 });
  useEffect(() => {
    setCounts({
      emails: getCount("emails"),
      meetings: getCount("meetings"),
      tasks: getCount("tasks"),
      research: getCount("research"),
    });
  }, []);

  const kpis = [
    { label: "Emails Generated", value: counts.emails, icon: Mail, trend: "+12%" },
    { label: "Meetings Summarized", value: counts.meetings, icon: FileText, trend: "+8%" },
    { label: "Task Plans", value: counts.tasks, icon: ListChecks, trend: "+24%" },
    { label: "Research Reports", value: counts.research, icon: Search, trend: "+5%" },
  ];

  const actions = [
    { to: "/email", label: "New Email", desc: "Draft a polished email in seconds.", icon: Mail },
    { to: "/meetings", label: "Summarize Meeting", desc: "Turn raw notes into action items.", icon: FileText },
    { to: "/tasks", label: "Create Task Plan", desc: "Break goals into a working timeline.", icon: ListChecks },
    { to: "/research", label: "Start Research", desc: "Get a structured briefing fast.", icon: Search },
  ] as const;

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
        {/* Hero */}
        <Card className="relative overflow-hidden border-0 p-8 text-primary-foreground shadow-glow gradient-primary">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Aria AI
            </div>
            <h1 className="font-display text-3xl font-bold leading-tight md:text-4xl">
              Good to see you. What shall we ship today?
            </h1>
            <p className="mt-2 text-sm text-white/80 md:text-base">
              One workspace for emails, meetings, tasks, and research — automated by AI.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="secondary" className="font-semibold">
                <Link to="/chat">
                  <MessageSquare className="h-4 w-4" /> Ask Aria
                </Link>
              </Button>
              <Button asChild variant="ghost" className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground">
                <Link to="/email">
                  Draft an email <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label} className="p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow">
              <div className="flex items-start justify-between">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <k.icon className="h-5 w-5" />
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-success">
                  <TrendingUp className="h-3 w-3" /> {k.trend}
                </span>
              </div>
              <div className="mt-4 font-display text-3xl font-bold">{k.value}</div>
              <div className="text-sm text-muted-foreground">{k.label}</div>
            </Card>
          ))}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Quick actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map((a) => (
              <Link key={a.to} to={a.to} className="group">
                <Card className="h-full p-5 shadow-soft transition group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-glow">
                  <div className="grid h-10 w-10 place-items-center rounded-lg gradient-primary text-primary-foreground">
                    <a.icon className="h-5 w-5" />
                  </div>
                  <div className="mt-4 font-semibold">{a.label}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{a.desc}</div>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        <Card className="border-dashed bg-muted/30 p-4 text-xs text-muted-foreground">
          <strong className="text-foreground">Responsible AI:</strong> outputs may contain
          inaccuracies. Review before sharing externally or making business decisions.
        </Card>
      </div>
    </AppShell>
  );
}
