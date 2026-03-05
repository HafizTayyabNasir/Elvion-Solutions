"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  Calendar,
  FolderOpen,
  ListTodo,
  Loader2,
  CircleDot,
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Task {
  id: number;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project: { id: number; name: string } | null;
  assignee: { id: number; name: string | null; email: string } | null;
  creator: { id: number; name: string | null } | null;
}

interface Summary {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  overdue: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  todo: { label: "To Do", color: "text-gray-400", bg: "bg-gray-500/20 text-gray-400" },
  in_progress: { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/20 text-blue-400" },
  review: { label: "Review", color: "text-yellow-400", bg: "bg-yellow-500/20 text-yellow-400" },
  done: { label: "Done", color: "text-green-400", bg: "bg-green-500/20 text-green-400" },
};

const priorityConfig: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "text-gray-400" },
  medium: { label: "Medium", color: "text-blue-400" },
  high: { label: "High", color: "text-orange-400" },
  urgent: { label: "Urgent", color: "text-red-400" },
};

export default function EmployeeTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [view, setView] = useState<"list" | "board">("list");

  const fetchTasks = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterPriority) params.set("priority", filterPriority);
      const res = await fetch(`/api/employee/tasks?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load tasks");
      const data = await res.json();
      setTasks(data.tasks);
      setSummary(data.summary);
    } catch {
      console.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterPriority]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const updateStatus = async (taskId: number, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employee/tasks", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await fetchTasks();
    } catch {
      alert("Failed to update task status");
    } finally {
      setUpdatingId(null);
    }
  };

  const isOverdue = (task: Task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  const filtered = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.project?.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">My Tasks</h1>
        <p className="text-gray-400 text-sm mt-1">Track and manage your assigned tasks</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: summary.total, icon: ListTodo, color: "text-white", bg: "bg-white/5" },
          { label: "To Do", value: summary.todo, icon: CircleDot, color: "text-gray-400", bg: "bg-gray-500/10" },
          { label: "In Progress", value: summary.inProgress, icon: Loader2, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Review", value: summary.review, icon: Eye, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Done", value: summary.done, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Overdue", value: summary.overdue, icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-white/5`}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={16} className={s.color} />
              <span className="text-xs text-gray-400">{s.label}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search tasks..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary"
          />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setLoading(true); }}
          className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Done</option>
        </select>
        <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setLoading(true); }}
          className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <div className="flex bg-elvion-card border border-white/10 rounded-lg overflow-hidden">
          <button onClick={() => setView("list")}
            className={`px-3 py-2 text-sm ${view === "list" ? "bg-elvion-primary text-black" : "text-gray-400 hover:text-white"}`}>
            List
          </button>
          <button onClick={() => setView("board")}
            className={`px-3 py-2 text-sm ${view === "board" ? "bg-elvion-primary text-black" : "text-gray-400 hover:text-white"}`}>
            Board
          </button>
        </div>
      </div>

      {/* Board View */}
      {view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {(["todo", "in_progress", "review", "done"] as const).map((col) => {
            const colTasks = filtered.filter(t => t.status === col);
            const cfg = statusConfig[col];
            return (
              <div key={col} className="bg-elvion-card rounded-xl border border-white/10 flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <span className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</span>
                  <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{colTasks.length}</span>
                </div>
                <div className="p-3 space-y-2 flex-1 overflow-y-auto max-h-[60vh]">
                  {colTasks.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-8">No tasks</p>
                  ) : (
                    colTasks.map(task => (
                      <div key={task.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          isOverdue(task) ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/5 hover:border-white/10"
                        }`}>
                        <p className="text-sm font-medium text-white mb-1">{task.title}</p>
                        {task.project && (
                          <p className="text-xs text-purple-400 mb-2">
                            <FolderOpen size={10} className="inline mr-1" />{task.project.name}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${priorityConfig[task.priority]?.color || "text-gray-400"}`}>
                            {priorityConfig[task.priority]?.label || task.priority}
                          </span>
                          {task.dueDate && (
                            <span className={`text-xs flex items-center gap-1 ${isOverdue(task) ? "text-red-400" : "text-gray-500"}`}>
                              <Calendar size={10} />
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                            </span>
                          )}
                        </div>
                        {task.status !== col && updatingId !== task.id && (
                          <select value={task.status}
                            onChange={(e) => updateStatus(task.id, e.target.value)}
                            className="w-full mt-2 px-2 py-1 text-xs bg-elvion-dark border border-white/10 rounded text-white outline-none">
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="done">Done</option>
                          </select>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        filtered.length === 0 ? (
          <div className="text-center py-16 bg-elvion-card border border-white/10 rounded-xl">
            <ListTodo size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Tasks Found</h3>
            <p className="text-gray-500 text-sm">You don&apos;t have any tasks assigned yet.</p>
          </div>
        ) : (
          <div className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Task</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Project</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Priority</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Due Date</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Created By</th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map(task => (
                    <>
                      <tr key={task.id} className={`hover:bg-white/5 transition ${isOverdue(task) ? "bg-red-500/5" : ""}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {isOverdue(task) && <AlertCircle size={14} className="text-red-400 shrink-0" />}
                            <span className="text-sm font-medium text-white">{task.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {task.project ? (
                            <Link href="/employee/projects" className="text-sm text-purple-400 hover:underline flex items-center gap-1">
                              <FolderOpen size={12} />{task.project.name}
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-medium ${priorityConfig[task.priority]?.color || "text-gray-400"}`}>
                            {priorityConfig[task.priority]?.label || task.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {task.dueDate ? (
                            <span className={`text-sm flex items-center gap-1.5 ${isOverdue(task) ? "text-red-400 font-medium" : "text-gray-400"}`}>
                              <Calendar size={13} />
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {updatingId === task.id ? (
                            <Loader2 size={16} className="animate-spin text-elvion-primary" />
                          ) : (
                            <select value={task.status}
                              onChange={(e) => updateStatus(task.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusConfig[task.status]?.bg || "bg-gray-500/20 text-gray-400"}`}>
                              <option value="todo">To Do</option>
                              <option value="in_progress">In Progress</option>
                              <option value="review">Review</option>
                              <option value="done">Done</option>
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {task.creator?.name || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => setExpandedId(expandedId === task.id ? null : task.id)}
                            className="text-gray-400 hover:text-white p-1 transition">
                            {expandedId === task.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {expandedId === task.id && (
                        <tr key={`${task.id}-detail`} className="bg-white/5">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Description</p>
                                <p className="text-gray-300">{task.description || "No description provided"}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Created</span>
                                  <span className="text-gray-300">{new Date(task.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Last Updated</span>
                                  <span className="text-gray-300">{new Date(task.updatedAt).toLocaleDateString()}</span>
                                </div>
                                {task.completedAt && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Completed</span>
                                    <span className="text-green-400">{new Date(task.completedAt).toLocaleDateString()}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Assigned To</span>
                                  <span className="text-gray-300">{task.assignee?.name || task.assignee?.email || "Unassigned"}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
