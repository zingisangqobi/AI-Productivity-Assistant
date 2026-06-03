import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { getGateway, DEFAULT_MODEL } from "./ai-gateway.server";

async function run(prompt: string, system: string) {
  const gateway = getGateway();
  const { text } = await generateText({
    model: gateway(DEFAULT_MODEL),
    system,
    prompt,
  });
  return { text };
}

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      recipient: z.string().min(1),
      purpose: z.string().min(1),
      tone: z.string().min(1),
      keyPoints: z.string().default(""),
    }),
  )
  .handler(async ({ data }) => {
    const prompt = `Recipient: ${data.recipient}
Purpose: ${data.purpose}
Tone: ${data.tone}
Key Points:
${data.keyPoints}

Requirements:
- Professional language
- Clear structure
- Strong subject line
- Action-oriented conclusion

Return in this exact format:
Subject: <subject line>

<email body>`;
    return run(prompt, "You are a professional workplace communication assistant. Generate concise, effective emails.");
  });

export const summarizeMeeting = createServerFn({ method: "POST" })
  .inputValidator(z.object({ title: z.string().default(""), transcript: z.string().min(10) }))
  .handler(async ({ data }) => {
    const prompt = `Meeting: ${data.title || "Untitled"}

Summarize these notes. Use markdown with these sections:
## Executive Summary
## Key Discussion Points
## Decisions Made
## Action Items
## Risks or Blockers

Transcript:
${data.transcript}`;
    return run(prompt, "You are an expert meeting assistant.");
  });

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      goal: z.string().min(1),
      deadline: z.string().default(""),
      priority: z.string().default("Medium"),
    }),
  )
  .handler(async ({ data }) => {
    const prompt = `Goal: ${data.goal}
Deadline: ${data.deadline || "Unspecified"}
Priority: ${data.priority}

Return a structured plan in markdown with:
## Task Breakdown (numbered list)
## Suggested Timeline
## Priority Ranking
## Estimated Effort`;
    return run(prompt, "You are a workplace productivity planner.");
  });

export const researchTopic = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      topic: z.string().min(1),
      context: z.string().default(""),
      format: z.string().default("Report"),
    }),
  )
  .handler(async ({ data }) => {
    const prompt = `Research Topic: ${data.topic}
Context: ${data.context}
Format: ${data.format}

Return in markdown:
## Summary
## Key Findings
## Supporting Evidence
## Recommendations
## Sources (cite as plausible references)`;
    return run(prompt, "You are an expert research analyst.");
  });
