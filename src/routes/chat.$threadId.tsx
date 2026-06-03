import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/markdown";
import { loadList, saveList } from "@/lib/local-store";
import { Plus, Trash2, Send, MessageSquare, Sparkles, StopCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
};

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [{ title: "AI Chat — Aria" }, { name: "description", content: "Chat with Aria, your AI workplace copilot." }],
  }),
  component: ChatPage,
});

const STARTERS = [
  "Draft a client proposal for a 6-week design sprint",
  "Summarize this report in 5 bullet points",
  "Create a project plan to launch a mobile app",
  "Improve this email to sound more confident",
  "Generate a meeting agenda for our weekly standup",
];

function ChatPage() {
  const { threadId } = useParams({ from: "/chat/$threadId" });
  const navigate = useNavigate();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const t = loadList<ChatThread>("chatThreads");
    setThreads(t);
    setHydrated(true);
    if (t.length > 0 && !t.find((x) => x.id === threadId)) {
      navigate({ to: "/chat/$threadId", params: { threadId: t[0].id }, replace: true });
    }
  }, [threadId, navigate]);

  const active = useMemo(() => threads.find((t) => t.id === threadId), [threads, threadId]);
  if (!hydrated || !active) {
    return (
      <AppShell>
        <div className="p-10 text-sm text-muted-foreground">Loading chat…</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ChatView
        key={threadId}
        threadId={threadId}
        initialMessages={active.messages}
        threads={threads}
        onThreadsChange={setThreads}
      />
    </AppShell>
  );
}

function ChatView({
  threadId,
  initialMessages,
  threads,
  onThreadsChange,
}: {
  threadId: string;
  initialMessages: UIMessage[];
  threads: ChatThread[];
  onThreadsChange: (t: ChatThread[]) => void;
}) {
  const navigate = useNavigate();
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loading = status === "submitted" || status === "streaming";

  useEffect(() => {
    inputRef.current?.focus();
  }, [threadId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Persist on every change
  useEffect(() => {
    const next = threads.map((t) => {
      if (t.id !== threadId) return t;
      const firstUser = messages.find((m) => m.role === "user");
      const title = firstUser
        ? extractText(firstUser).slice(0, 48) || "New chat"
        : t.title;
      return { ...t, title, messages, updatedAt: Date.now() };
    });
    onThreadsChange(next);
    saveList("chatThreads", next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status]);

  function send() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    sendMessage({ text });
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function newThread() {
    const id = crypto.randomUUID();
    const next: ChatThread[] = [{ id, title: "New chat", updatedAt: Date.now(), messages: [] }, ...threads];
    onThreadsChange(next);
    saveList("chatThreads", next);
    navigate({ to: "/chat/$threadId", params: { threadId: id } });
  }

  function deleteThread(id: string) {
    const next = threads.filter((t) => t.id !== id);
    onThreadsChange(next);
    saveList("chatThreads", next);
    if (id === threadId) {
      if (next.length > 0) {
        navigate({ to: "/chat/$threadId", params: { threadId: next[0].id } });
      } else {
        const fresh = { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [] };
        saveList("chatThreads", [fresh]);
        onThreadsChange([fresh]);
        navigate({ to: "/chat/$threadId", params: { threadId: fresh.id } });
      }
    }
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Threads */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/40 md:flex md:flex-col">
        <div className="border-b border-border p-3">
          <Button onClick={newThread} className="w-full gradient-primary text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group mb-1 flex items-center gap-1 rounded-md px-2 py-1.5 text-sm transition",
                t.id === threadId ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
              )}
            >
              <button
                className="flex flex-1 items-center gap-2 truncate text-left"
                onClick={() => navigate({ to: "/chat/$threadId", params: { threadId: t.id } })}
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
              </button>
              <button
                onClick={() => deleteThread(t.id)}
                aria-label="Delete thread"
                className="opacity-0 transition group-hover:opacity-100 hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {/* Conversation */}
      <div className="flex flex-1 flex-col">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-primary-foreground shadow-glow">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h2 className="font-display text-2xl font-bold">How can I help you today?</h2>
                <p className="mt-1 text-sm text-muted-foreground">Aria can draft, summarize, plan, and research.</p>
                <div className="mt-6 grid w-full gap-2 sm:grid-cols-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput("");
                        sendMessage({ text: s });
                      }}
                      className="rounded-lg border border-border bg-card p-3 text-left text-sm transition hover:border-primary/40 hover:shadow-soft"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((m) => (
                  <MessageRow key={m.id} message={m} />
                ))}
                {loading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-primary" />
                    Thinking…
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-background/80 backdrop-blur">
          <div className="mx-auto max-w-3xl p-4">
            <Card className="flex items-end gap-2 p-2 shadow-soft">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Message Aria… (Shift+Enter for newline)"
                className="min-h-[52px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
                rows={1}
              />
              {loading ? (
                <Button size="icon" variant="ghost" onClick={() => stop()} aria-label="Stop">
                  <StopCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={send}
                  disabled={!input.trim()}
                  className="gradient-primary text-primary-foreground"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </Card>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Aria can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function extractText(m: UIMessage): string {
  return (m.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join(" ")
    .trim();
}

function MessageRow({ message }: { message: UIMessage }) {
  const text = extractText(message);
  const isUser = message.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg gradient-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "")}>
        {isUser ? (
          <div className="rounded-2xl bg-primary px-4 py-2.5 text-primary-foreground shadow-soft">
            <p className="whitespace-pre-wrap text-sm">{text}</p>
          </div>
        ) : (
          <Markdown>{text}</Markdown>
        )}
      </div>
    </div>
  );
}
