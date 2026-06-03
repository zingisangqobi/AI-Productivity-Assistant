import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getGateway, DEFAULT_MODEL } from "@/lib/ai-gateway.server";

type ChatBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages required", { status: 400 });
        }
        const gateway = getGateway();
        const result = streamText({
          model: gateway(DEFAULT_MODEL),
          system:
            "You are Aria, an AI workplace productivity assistant. Help users draft emails, summarize meetings, plan tasks, research topics, and improve their work. Be concise, structured, and action-oriented. Use markdown for formatting.",
          messages: await convertToModelMessages(messages as UIMessage[]),
        });
        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
