"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Plus, X, Edit2, Trash2, CheckSquare, Clock, AlertCircle, User, DollarSign, Timer, ChevronDown, ChevronRight } from "lucide-react";

interface Employee {
  id: number; employeeId: string; firstName: string; lastName: string;
  userId: number | null; positions: string[];
}

interface Task {
  id: number; title: string; description: string; status: string; priority: string;
  dueDate: string; startDate: string; completedAt: string;
  estimatedHours: number | null; actualHours: number | null; budget: number | null;
  project: { id: number; name: string } | null;
  assignee: { id: number; name: string; email: string } | null;
  creator: { id: number; name: string } | null; createdAt: string;
}

const statusOptions = ["todo", "in_progress", "review", "done"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const statusLabels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };
const priorityLabels: Record<string, string> = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", startDate: "", projectId: "", assigneeId: "", estimatedHours: "", actualHours: "", budget: "" });

  const fetchData = () => {
    Promise.all([
      fetchAPI("/tasks"),
      fetchAPI("/projects").catch(() => []),
      fetchAPI("/hr/employees").catch(() => []),
    ]).then(([t, p, e]) => { setTasks(t); setProjects(p); setEmployees(Array.isArray(e) ? e : (e.employees || [])); }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, projectId: form.projectId ? parseInt(form.projectId) : null, assigneeId: form.assigneeId ? parseInt(form.assigneeId) : null, estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : null, actualHours: form.actualHours ? parseFloat(form.actualHours) : null, budget: form.budget ? parseFloat(form.budget) : null };
    try {
      if (editId) { await fetchAPI(`/tasks/${editId}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await fetchAPI("/tasks", { method: "POST", body: JSON.stringify(body) }); }
      setShowForm(false); setEditId(null);
      setForm({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", startDate: "", projectId: "", assigneeId: "", estimatedHours: "", actualHours: "", budget: "" });
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    try { await fetchAPI(`/tasks/${id}`, { method: "DELETE" }); fetchData(); } catch (err) { console.error(err); }
  };

  const startEdit = (t: Task) => {
    setForm({ title: t.title, description: t.description || "", status: t.status, priority: t.priority || "medium", dueDate: t.dueDate ? t.dueDate.split("T")[0] : "", startDate: t.startDate ? t.startDate.split("T")[0] : "", projectId: t.project?.id?.toString() || "", assigneeId: t.assignee?.id?.toString() || "", estimatedHours: t.estimatedHours?.toString() || "", actualHours: t.actualHours?.toString() || "", budget: t.budget?.toString() || "" });
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

  const getStatusBadge = (s: string) => {
    const c: Record<string, string> = { todo: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400", in_progress: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", review: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400", done: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" };
    return c[s] || "bg-gray-100 text-gray-600";
  };

  // Only employees with linked user accounts
  const employeeOptions = employees.filter((emp: Employee) => emp.userId).map((emp: Employee) => ({ id: emp.userId!, name: `${emp.firstName} ${emp.lastName}`, employeeId: emp.employeeId, positions: emp.positions }));

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.assignee?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    const matchPriority = filterPriority === "all" || t.priority === filterPriority;
    const matchProject = filterProject === "all" || t.project?.id?.toString() === filterProject;
    return matchSearch && matchStatus && matchPriority && matchProject;
  });

  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;
  const totalBudget = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1><p className="text-gray-500 mt-1">Manage and track tasks across projects</p></div>
        <div className="flex gap-2">
          <div className="flex bg-white dark:bg-elvion-card rounded-lg border border-gray-200 dark:border-white/10">
            <button onClick={() => setViewMode("board")} className={`px-3 py-2 text-xs rounded-l-lg ${viewMode === "board" ? "bg-elvion-primary text-black" : "text-gray-500"}`}>Board</button>
            <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-xs rounded-r-lg ${viewMode === "list" ? "bg-elvion-primary text-black" : "text-gray-500"}`}>List</button>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", description: "", status: "todo", priority: "medium", dueDate: "", startDate: "", projectId: "", assigneeId: "", estimatedHours: "", actualHours: "", budget: "" }); }}
            className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> Add Task</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total", value: tasks.length, color: "text-gray-900 dark:text-white" },
          { label: "To Do", value: tasks.filter(t => t.status === "todo").length, color: "text-gray-400" },
          { label: "In Progress", value: tasks.filter(t => t.status === "in_progress").length, color: "text-blue-400" },
          { label: "Done", value: tasks.filter(t => t.status === "done").length, color: "text-green-400" },
          { label: "Overdue", value: overdueTasks, color: overdueTasks > 0 ? "text-red-400" : "text-gray-400" },
          { label: "Total Budget", value: `$${totalBudget.toLocaleString()}`, color: "text-elvion-primary" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search tasks or assignee..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white text-sm">
          <option value="all">All Status</option>{statusOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white text-sm">
          <option value="all">All Priority</option>{priorityOptions.map(p => <option key={p} value={p}>{priorityLabels[p]}</option>)}
        </select>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white text-sm">
          <option value="all">All Projects</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Task" : "New Task"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-gray-500 mb-1">Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm text-gray-500 mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none" /></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{statusOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{priorityOptions.map(p => <option key={p} value={p}>{priorityLabels[p]}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Project</label><select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"><option value="">None</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Assign to Employee</label>
                  <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">
                    <option value="">Unassigned</option>
                    {employeeOptions.map(emp => <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Est. Hours</label><input type="number" step="0.5" min="0" value={form.estimatedHours} onChange={e => setForm({ ...form, estimatedHours: e.target.value })} placeholder="0" className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Actual Hours</label><input type="number" step="0.5" min="0" value={form.actualHours} onChange={e => setForm({ ...form, actualHours: e.target.value })} placeholder="0" className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Budget ($)</label><input type="number" step="0.01" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="0" className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
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
            const colBudget = statusTasks.reduce((s, t) => s + (t.budget || 0), 0);
            return (
              <div key={status} className="min-w-[300px] flex-1">
                <div className={`rounded-xl border-t-4 ${getStatusColor(status)} border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card`}>
                  <div className="p-3 border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{statusLabels[status]}</h3>
                      <span className="ml-auto text-xs bg-gray-100 dark:bg-white/5 rounded-full px-2 py-0.5 text-gray-500">{statusTasks.length}</span>
                    </div>
                    {colBudget > 0 && <p className="text-[10px] text-elvion-primary mt-1">${colBudget.toLocaleString()} budget</p>}
                  </div>
                  <div className="p-2 space-y-2 max-h-[600px] overflow-y-auto">
                    {statusTasks.map(task => (
                      <div key={task.id} className="bg-gray-50 dark:bg-elvion-dark/50 rounded-lg p-3 group hover:bg-gray-100 dark:hover:bg-elvion-dark transition-colors">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">{task.title}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(task)} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={12} /></button>
                            <button onClick={() => handleDelete(task.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={12} /></button>
                          </div>
                        </div>
                        {task.project && <p className="text-[10px] text-elvion-primary mt-1">{task.project.name}</p>}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                          {task.budget != null && task.budget > 0 && <span className="text-[10px] text-elvion-primary flex items-center gap-0.5"><DollarSign size={9} />{task.budget}</span>}
                          {task.estimatedHours != null && task.estimatedHours > 0 && <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><Timer size={9} />{task.estimatedHours}h</span>}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          {task.assignee && <div className="flex items-center gap-1 text-[10px] text-gray-400"><User size={10} /> {task.assignee.name}</div>}
                          {task.dueDate && <p className={`text-[10px] ${new Date(task.dueDate) < new Date() && task.status !== "done" ? "text-red-400 font-medium" : "text-gray-400"}`}>{new Date(task.dueDate).toLocaleDateString()}</p>}
                        </div>
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
                <th className="p-3 w-8"></th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Task</th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Project</th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Status</th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Priority</th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Assignee</th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Timeline</th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Hours</th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Budget</th>
                <th className="p-3 text-gray-900 dark:text-white font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map(task => {
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                  const isExpanded = expandedId === task.id;
                  return (
                    <tbody key={task.id}>
                      <tr className={`border-t border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer ${isOverdue ? "bg-red-50/30 dark:bg-red-500/5" : ""}`} onClick={() => setExpandedId(isExpanded ? null : task.id)}>
                        <td className="p-3 text-gray-400">{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</td>
                        <td className="p-3"><p className="font-medium text-gray-900 dark:text-white">{task.title}</p></td>
                        <td className="p-3 text-elvion-primary text-xs">{task.project?.name || "—"}</td>
                        <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBadge(task.status)}`}>{statusLabels[task.status]}</span></td>
                        <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                        <td className="p-3 text-gray-500 text-xs">{task.assignee?.name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                        <td className="p-3 text-xs">
                          {task.startDate && <span className="text-gray-400 block">{new Date(task.startDate).toLocaleDateString()}</span>}
                          {task.dueDate && <span className={`block ${isOverdue ? "text-red-400 font-medium" : "text-gray-500"}`}>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
                          {!task.startDate && !task.dueDate && "—"}
                        </td>
                        <td className="p-3 text-xs text-gray-500">{task.estimatedHours ? `${task.actualHours || 0}/${task.estimatedHours}h` : "—"}</td>
                        <td className="p-3 text-xs text-gray-500">{task.budget ? `$${task.budget.toLocaleString()}` : "—"}</td>
                        <td className="p-3" onClick={e => e.stopPropagation()}>
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(task)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(task.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/50 dark:bg-white/[0.02]">
                          <td colSpan={10} className="p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              {task.description && <div className="col-span-full"><p className="text-gray-500 font-medium mb-1">Description</p><p className="text-gray-700 dark:text-gray-300">{task.description}</p></div>}
                              <div><p className="text-gray-500 font-medium">Created</p><p className="text-gray-700 dark:text-gray-300">{new Date(task.createdAt).toLocaleDateString()}</p></div>
                              <div><p className="text-gray-500 font-medium">Created By</p><p className="text-gray-700 dark:text-gray-300">{task.creator?.name || "—"}</p></div>
                              {task.completedAt && <div><p className="text-gray-500 font-medium">Completed</p><p className="text-green-500">{new Date(task.completedAt).toLocaleDateString()}</p></div>}
                              {task.estimatedHours != null && task.estimatedHours > 0 && (
                                <div><p className="text-gray-500 font-medium">Hours Progress</p>
                                  <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-1"><div className="h-full bg-elvion-primary rounded-full" style={{ width: `${Math.min(100, ((task.actualHours || 0) / task.estimatedHours) * 100)}%` }}></div></div>
                                  <p className="text-gray-400 mt-0.5">{task.actualHours || 0} of {task.estimatedHours}h</p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No tasks found</div>}
        </div>
      )}
    </div>
  );
}
