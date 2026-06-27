import { NextRequest, NextResponse } from "next/server";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const PrioritySchema = z.object({
  rankedTasks: z.array(z.object({
    taskId: z.string(),
    suggestedPriority: z.enum(["low", "medium", "high", "critical"]),
    reasoning: z.string(),
    estimatedHours: z.number(),
  })),
  summary: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json();
    if (!tasks?.length) return NextResponse.json({ error: "No tasks provided" }, { status: 400 });

    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      schema: PrioritySchema,
      prompt: `You are a productivity expert. Analyze these tasks and provide intelligent prioritization:

${JSON.stringify(tasks, null, 2)}

For each task, suggest a priority level (low/medium/high/critical), explain your reasoning in one sentence, and estimate hours to complete. Consider business impact, urgency, and dependencies.`,
    });

    return NextResponse.json(object);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
