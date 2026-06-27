"use client";
import { useState, useEffect } from "react";

interface Task {
  taskId: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "todo" | "in_progress" | "done";
  deadline?: string;
  createdAt: string;
  aiSuggestion?: string;
}

const PRIORITY_COLORS = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const STATUS_COLORS = {
  todo: "border-gray-300",
  in_progress: "border-blue-400",
  done: "border-green-400",
};

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium" as const });
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(data.tasks || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const data = await res.json();
      setTasks(prev => [data.task, ...prev]);
      setNewTask({ title: "", description: "", priority: "medium" });
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (taskId: string, status: Task["status"]) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, updates: { status } }),
    });
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status } : t));
  };

  const deleteTask = async (taskId: string) => {
    await fetch(`/api/tasks?taskId=${taskId}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t.taskId !== taskId));
  };

  const prioritizeWithAI = async () => {
    if (!tasks.length) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/prioritize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tasks: tasks.map(t => ({ taskId: t.taskId, title: t.title, description: t.description, priority: t.priority })) }),
      });
      const data = await res.json();
      if (data.rankedTasks) {
        setTasks(prev => prev.map(task => {
          const suggestion = data.rankedTasks.find((r: any) => r.taskId === task.taskId);
          return suggestion ? { ...task, aiSuggestion: `${suggestion.suggestedPriority}: ${suggestion.reasoning} (~${suggestion.estimatedHours}h)` } : task;
        }));
      }
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">TaskFlow AI</h1>
            <p className="text-purple-300 mt-1">AI-powered tasks on AWS DynamoDB</p>
          </div>
          <div className="flex gap-3">
            <button onClick={prioritizeWithAI} disabled={aiLoading || !tasks.length}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition">
              {aiLoading ? "Analyzing..." : "✨ AI Prioritize"}
            </button>
            <button onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-white text-slate-900 rounded-lg text-sm font-medium hover:bg-gray-100 transition">
              + New Task
            </button>
          </div>
        </div>

        {/* Create Form */}
        {showForm && (
          <form onSubmit={createTask} className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6 border border-white/20">
            <h2 className="text-white font-semibold mb-4">Create Task</h2>
            <div className="space-y-3">
              <input value={newTask.title} onChange={e => setNewTask(p => ({...p, title: e.target.value}))}
                placeholder="Task title" required
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400"/>
              <textarea value={newTask.description} onChange={e => setNewTask(p => ({...p, description: e.target.value}))}
                placeholder="Description (optional)" rows={2}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-400 resize-none"/>
              <select value={newTask.priority} onChange={e => setNewTask(p => ({...p, priority: e.target.value as any}))}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-400">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" disabled={creating}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                  {creating ? "Creating..." : "Create"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition">
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Task List */}
        {loading ? (
          <div className="text-center text-white/60 py-12">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-white/60">No tasks yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task.taskId}
                className={`bg-white/10 backdrop-blur rounded-xl p-5 border-l-4 ${STATUS_COLORS[task.status]} border border-white/10 hover:bg-white/15 transition`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-semibold text-white ${task.status === "done" ? "line-through opacity-60" : ""}`}>
                        {task.title}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.description && <p className="text-white/60 text-sm mt-1">{task.description}</p>}
                    {task.aiSuggestion && (
                      <p className="text-purple-300 text-xs mt-2">✨ AI: {task.aiSuggestion}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select value={task.status} onChange={e => updateStatus(task.taskId, e.target.value as Task["status"])}
                      className="text-xs px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none">
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <button onClick={() => deleteTask(task.taskId)}
                      className="text-white/40 hover:text-red-400 transition text-lg leading-none">&times;</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-white/30 text-sm">
          <p>Built with Next.js 14 · AWS DynamoDB · Vercel · OpenAI</p>
          <p className="mt-1">H0: Hack the Zero Stack Submission</p>
        </div>
      </div>
    </main>
  );
}
