"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Plus, X, Edit2, Trash2, CheckSquare, Clock, AlertCircle, User } from "lucide-react";

interface Task {
  id: number; title: string; description: string; status: string; priority: string;
  dueDate: string; project: { id: number; name: string } | null;
  assignee: { id: number; name: string; email: string } | null;
  creator: { id: number; name: string } | null; createdAt: string;
}

const statusOptions = ["todo", "in_progress", "review", "done"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const statusLabels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", projectId: "", assigneeId: "" });

  const fetchData = () => {
    Promise.all([
      fetchAPI("/tasks"),
      fetchAPI("/projects").catch(() => []),
      fetchAPI("/users").catch(() => []),
    ]).then(([t, p, u]) => { setTasks(t); setProjects(p); setUsers(u); }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, projectId: form.projectId ? parseInt(form.projectId) : null, assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null };
    try {
      if (editId) { await fetchAPI(`/tasks/${editId}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await fetchAPI("/tasks", { method: "POST", body: JSON.stringify(body) }); }
      setShowForm(false); setEditId(null);
      setForm({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", projectId: "", assigneeId: "" });
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try { await fetchAPI(`/tasks/${id}`, { method: "DELETE" }); fetchData(); } catch (err) { console.error(err); }
  };

  const startEdit = (t: Task) => {
    setForm({ title: t.title, description: t.description || "", status: t.status, priority: t.priority || "medium", dueDate: t.dueDate ? t.dueDate.split("T")[0] : "", projectId: t.project?.id?.toString() || "", assigneeId: t.assignee?.id?.toString() || "" });
    setEditId(t.id); setShowForm(true);
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { todo: "border-gray-300 bg-gray-50 dark:bg-gray-500/10", in_progress: "border-blue-400 bg-blue-50 dark:bg-blue-500/10", review: "border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10", done: "border-green-400 bg-green-50 dark:bg-green-500/10" };
    return c[s] || "border-gray-300 bg-gray-50";
  };

  const getPriorityColor = (p: string) => {
    const c: Record<string, string> = { low: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400", medium: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", high: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400", urgent: "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400" };
    return c[p] || "bg-gray-100 text-gray-600";
  };

  const getStatusIcon = (s: string) => {
    if (s === "done") return <CheckSquare size={14} className="text-green-500" />;
    if (s === "in_progress") return <Clock size={14} className="text-blue-500" />;
    if (s === "review") return <AlertCircle size={14} className="text-yellow-500" />;
    return <CheckSquare size={14} className="text-gray-400" />;
  };

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1><p className="text-gray-500 mt-1">Manage and track tasks</p></div>
        <div className="flex gap-2">
          <div className="flex bg-white dark:bg-elvion-card rounded-lg border border-gray-200 dark:border-white/10">
            <button onClick={() => setViewMode("board")} className={`px-3 py-2 text-xs rounded-l-lg ${viewMode === "board" ? "bg-elvion-primary text-black" : "text-gray-500"}`}>Board</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-xs rounded-r-lg ${viewMode === "list" ? "bg-elvion-primary text-black" : "text-gray-500"}`}>List</button>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", projectId: "", assigneeId: "" }); }}
            className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> Add Task</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Task" : "New Task"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-gray-500 mb-1">Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm text-gray-500 mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{statusOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Project</label><select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"><option value="">None</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Assignee</label><select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"><option value="">Unassigned</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90">{editId ? "Update Task" : "Create Task"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Board View */}
      {viewMode === "board" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusOptions.map(status => {
            const statusTasks = filtered.filter(t => t.status === status);
            return (
              <div key={status} className="min-w-[280px] flex-shrink-0">
                <div className={`rounded-xl border-t-4 ${getStatusColor(status)} border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card`}>
                  <div className="p-3 border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{statusLabels[status]}</h3>
                      <span className="ml-auto text-xs bg-gray-100 dark:bg-white/5 rounded-full px-2 py-0.5 text-gray-500">{statusTasks.length}</span>
                    </div>
                  </div>
                  <div className="p-2 space-y-2 max-h-[500px] overflow-y-auto">
                    {statusTasks.map(task => (
                      <div key={task.id} className="bg-gray-50 dark:bg-elvion-dark/50 rounded-lg p-3 group hover:bg-gray-100 dark:hover:bg-elvion-dark">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{task.title}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(task)} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={12} /></button>
                            <button onClick={() => handleDelete(task.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={12} /></button>
                          </div>
                        </div>
                        {task.project && <p className="text-[10px] text-elvion-primary mt-1">{task.project.name}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                          {task.assignee && <div className="flex items-center gap-1 text-[10px] text-gray-400"><User size={10} /> {task.assignee.name}</div>}
                        </div>
                        {task.dueDate && <p className="text-[10px] text-gray-400 mt-1">{new Date(task.dueDate).toLocaleDateString()}</p>}
                      </div>
                    ))}
                    {statusTasks.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No tasks</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-white/5"><tr>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Task</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Project</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Status</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Priority</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Assignee</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Due</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(task => (
                  <tr key={task.id} className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="p-4"><p className="font-medium text-gray-900 dark:text-white">{task.title}</p></td>
                    <td className="p-4 text-elvion-primary text-xs">{task.project?.name || "—"}</td>
                    <td className="p-4"><span className="text-xs flex items-center gap-1">{getStatusIcon(task.status)} {statusLabels[task.status]}</span></td>
                    <td className="p-4"><span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                    <td className="p-4 text-gray-500 text-xs">{task.assignee?.name || "Unassigned"}</td>
                    <td className="p-4 text-gray-500 text-xs">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="p-4"><div className="flex gap-2"><button onClick={() => startEdit(task)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={14} /></button><button onClick={() => handleDelete(task.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No tasks found</div>}
        </div>
      )}
    </div>
  );
}
