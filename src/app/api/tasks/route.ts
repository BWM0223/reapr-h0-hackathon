import { NextRequest, NextResponse } from "next/server";
import { dynamodb, TABLE_NAME } from "@/lib/dynamodb";
import {
  PutCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const TaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  deadline: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
});

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "demo-user";
  try {
    const result = await dynamodb.send(new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :uid",
      ExpressionAttributeValues: { ":uid": userId },
      ScanIndexForward: false,
    }));
    return NextResponse.json({ tasks: result.Items || [], count: result.Count });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "demo-user";
  try {
    const body = await req.json();
    const parsed = TaskSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const taskId = uuidv4();
    const now = new Date().toISOString();
    const task = {
      userId,
      taskId,
      ...parsed.data,
      createdAt: now,
      updatedAt: now,
    };
    await dynamodb.send(new PutCommand({ TableName: TABLE_NAME, Item: task }));
    return NextResponse.json({ task }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "demo-user";
  try {
    const { taskId, updates } = await req.json();
    if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });
    await dynamodb.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { userId, taskId },
      UpdateExpression: "SET #s = :s, updatedAt = :u",
      ExpressionAttributeNames: { "#s": "status" },
      ExpressionAttributeValues: { ":s": updates.status, ":u": new Date().toISOString() },
    }));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "demo-user";
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "taskId required" }, { status: 400 });
  try {
    await dynamodb.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { userId, taskId } }));
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
