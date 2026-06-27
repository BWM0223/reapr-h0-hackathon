import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const { tasks } = await req.json();
    if (!tasks?.length) return NextResponse.json({ error: "No tasks provided" }, { status: 400 });

    if (!OPENAI_API_KEY) {
      // Demo mode: return mock prioritization without API key
      const ranked = tasks.map((t: any, i: number) => ({
        taskId: t.taskId,
        suggestedPriority: i === 0 ? "critical" : i === 1 ? "high" : "medium",
        reasoning: "Based on task complexity and impact",
        estimatedHours: Math.ceil(Math.random() * 4) + 1,
      }));
      return NextResponse.json({ rankedTasks: ranked, summary: "Demo mode: AI prioritization" });
    }

    const prompt = `You are a productivity expert. Analyze these tasks and return ONLY a JSON object.

Tasks: ${JSON.stringify(tasks)}

Return this exact JSON structure:
{
  "rankedTasks": [
    {
      "taskId": "<id>",
      "suggestedPriority": "critical|high|medium|low",
      "reasoning": "one sentence",
      "estimatedHours": 2
    }
  ],
  "summary": "one sentence overview"
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
