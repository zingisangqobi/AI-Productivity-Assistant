import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { loadList, saveList } from "@/lib/local-store";

export type ChatThread = {
  id: string;
  title: string;
  updatedAt: number;
  messages: unknown[];
};

export const Route = createFileRoute("/chat/")({
  component: ChatRedirect,
});

function ChatRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    if (typeof window === "undefined") return;
    const threads = loadList<ChatThread>("chatThreads");
    let id: string;
    if (threads.length === 0) {
      id = crypto.randomUUID();
      const newThread: ChatThread = { id, title: "New chat", updatedAt: Date.now(), messages: [] };
      saveList("chatThreads", [newThread]);
    } else {
      id = threads[0].id;
    }
    navigate({ to: "/chat/$threadId", params: { threadId: id }, replace: true });
  }, [navigate]);
  return null;
}
