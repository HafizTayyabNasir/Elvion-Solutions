"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Plus, X, Edit2, Trash2, FolderOpen, Users, Calendar, DollarSign, ChevronDown, ChevronRight, Clock, CheckSquare, UserPlus, Timer, AlertCircle } from "lucide-react";

interface Employee {
  id: number; employeeId: string; firstName: string; lastName: string;
  userId: number | null; positions: string[];
}

interface ProjectTask {
  id: number; title: string; status: string; priority: string;
  dueDate: string | null; startDate: string | null;
  budget: number | null; estimatedHours: number | null; actualHours: number | null;
  assignee: { id: number; name: string } | null;
}

interface Project {
  id: number; name: string; description: string; status: string; priority: string;
  startDate: string; endDate: string; budget: number; progress: number;
  owner: { id: number; name: string; email: string };
  members: { id: number; user: { id: number; name: string; email: string }; role: string }[];
  tasks: ProjectTask[];
  _count: { tasks: number; invoices: number; files: number };
}

const statusOptions = ["active", "on_hold", "completed", "cancelled"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const statusLabels: Record<string, string> = { active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled" };
const taskStatusLabels: Record<string, string> = { todo: "To Do", in_progress: "In Progress", review: "Review", done: "Done" };

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Record<number, string>>({});
  const [form, setForm] = useState({ name: "", description: "", status: "active", priority: "medium", startDate: "", endDate: "", budget: "", memberIds: [] as number[] });

  const fetchData = () => {
    Promise.all([
      fetchAPI("/projects"),
      fetchAPI("/hr/employees").catch(() => []),
    ]).then(([p, e]) => {
      setProjects(p);
      setEmployees(Array.isArray(e) ? e : (e.employees || []));
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const employeeOptions = employees.filter((emp: Employee) => emp.userId).map((emp: Employee) => ({ id: emp.userId!, name: `${emp.firstName} ${emp.lastName}`, employeeId: emp.employeeId }));

  const resetForm = () => setForm({ name: "", description: "", status: "active", priority: "medium", startDate: "", endDate: "", budget: "", memberIds: [] });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, budget: form.budget ? parseFloat(form.budget) : null };
    try {
      if (editId) { await fetchAPI(`/projects/${editId}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await fetchAPI("/projects", { method: "POST", body: JSON.stringify(body) }); }
      setShowForm(false); setEditId(null); resetForm(); fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project and all its tasks?")) return;
    try { await fetchAPI(`/projects/${id}`, { method: "DELETE" }); fetchData(); } catch (err) { console.error(err); }
  };

  const startEdit = (p: Project) => {
    setForm({
      name: p.name, description: p.description || "", status: p.status, priority: p.priority || "medium",
      startDate: p.startDate ? p.startDate.split("T")[0] : "", endDate: p.endDate ? p.endDate.split("T")[0] : "",
      budget: p.budget?.toString() || "",
      memberIds: p.members.filter((m: { role: string }) => m.role !== "client").map((m: { user: { id: number } }) => m.user.id),
    });
    setEditId(p.id); setShowForm(true);
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const getTaskStatusColor = (s: string) => {
    const c: Record<string, string> = { todo: "bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400", in_progress: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400", review: "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400", done: "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" };
    return c[s] || "bg-gray-100 text-gray-600";
  };

  const getPriorityDot = (p: string) => {
    const c: Record<string, string> = { low: "bg-gray-400", medium: "bg-blue-400", high: "bg-orange-400", urgent: "bg-red-500" };
    return c[p] || "bg-gray-400";
  };

  const calcProgress = (tasks: ProjectTask[]) => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter(t => t.status === "done").length / tasks.length) * 100);
  };

  const getDaysLeft = (endDate: string) => {
    if (!endDate) return null;
    const diff = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const toggleMember = (userId: number) => {
    setForm(f => ({
      ...f,
      memberIds: f.memberIds.includes(userId) ? f.memberIds.filter(id => id !== userId) : [...f.memberIds, userId]
    }));
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);
  const totalTaskBudget = projects.reduce((s, p) => s + p.tasks.reduce((ts, t) => ts + (t.budget || 0), 0), 0);
  const totalTasks = projects.reduce((s, p) => s + p.tasks.length, 0);
  const doneTasks = projects.reduce((s, p) => s + p.tasks.filter(t => t.status === "done").length, 0);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1><p className="text-gray-500 mt-1">Manage projects, teams, tasks & budgets</p></div>
        <button onClick={() => { setShowForm(true); setEditId(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> New Project</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: "Projects", value: projects.length, color: "text-gray-900 dark:text-white" },
          { label: "Active", value: projects.filter(p => p.status === "active").length, color: "text-green-400" },
          { label: "Total Tasks", value: totalTasks, color: "text-blue-400" },
          { label: "Tasks Done", value: doneTasks, color: "text-elvion-primary" },
          { label: "Project Budget", value: `$${totalBudget.toLocaleString()}`, color: "text-elvion-primary" },
          { label: "Task Budget", value: `$${totalTaskBudget.toLocaleString()}`, color: "text-yellow-400" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...statusOptions].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium ${filterStatus === s ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-500 border border-gray-200 dark:border-white/10"}`}>
              {s === "all" ? "All" : statusLabels[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-gray-500 mb-1">Project Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm text-gray-500 mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{statusOptions.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Budget ($)</label><input type="number" step="0.01" min="0" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              {/* Team Members */}
              <div>
                <label className="block text-sm text-gray-500 mb-2"><UserPlus size={14} className="inline mr-1" />Team Members</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[200px] overflow-y-auto p-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-elvion-dark">
                  {employeeOptions.map(emp => (
                    <label key={emp.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${form.memberIds.includes(emp.id) ? "bg-elvion-primary/10 border border-elvion-primary/30" : "hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                      <input type="checkbox" checked={form.memberIds.includes(emp.id)} onChange={() => toggleMember(emp.id)} className="accent-elvion-primary" />
                      <div>
                        <p className="text-gray-900 dark:text-white text-xs font-medium">{emp.name}</p>
                        <p className="text-gray-400 text-[10px]">{emp.employeeId}</p>
                      </div>
                    </label>
                  ))}
                  {employeeOptions.length === 0 && <p className="text-xs text-gray-400 col-span-full text-center py-2">No employees with accounts found</p>}
                </div>
                {form.memberIds.length > 0 && <p className="text-xs text-elvion-primary mt-1">{form.memberIds.length} team member(s) selected</p>}
              </div>
              <button type="submit" className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90">{editId ? "Update Project" : "Create Project"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Projects List */}
      <div className="space-y-4">
        {filtered.map(project => {
          const progress = project.progress || calcProgress(project.tasks);
          const daysLeft = getDaysLeft(project.endDate);
          const isExpanded = expandedId === project.id;
          const tab = activeTab[project.id] || "tasks";
          const taskBudget = project.tasks.reduce((s, t) => s + (t.budget || 0), 0);
          const taskEstHours = project.tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
          const taskActHours = project.tasks.reduce((s, t) => s + (t.actualHours || 0), 0);
          const overdueTasks = project.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done").length;

          return (
            <div key={project.id} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
              {/* Project Header */}
              <div className="p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : project.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-elvion-primary/10 mt-0.5">
                      {isExpanded ? <ChevronDown size={16} className="text-elvion-primary" /> : <ChevronRight size={16} className="text-elvion-primary" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{project.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>{statusLabels[project.status]}</span>
                        <div className={`w-2 h-2 rounded-full ${getPriorityDot(project.priority)}`} title={project.priority}></div>
                      </div>
                      {project.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{project.description}</p>}
                      
                      {/* Quick Stats Row */}
                      <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users size={12} /> {project.members.length} members</span>
                        <span className="flex items-center gap-1"><CheckSquare size={12} /> {project.tasks.filter(t => t.status === "done").length}/{project.tasks.length} tasks</span>
                        {project.budget != null && project.budget > 0 && <span className="flex items-center gap-1 text-elvion-primary"><DollarSign size={12} /> {project.budget.toLocaleString()}</span>}
                        {taskEstHours > 0 && <span className="flex items-center gap-1"><Timer size={12} /> {taskActHours}/{taskEstHours}h</span>}
                        {project.startDate && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(project.startDate).toLocaleDateString()}</span>}
                        {daysLeft !== null && (
                          <span className={`flex items-center gap-1 ${daysLeft < 0 ? "text-red-400 font-medium" : daysLeft < 7 ? "text-yellow-400" : "text-gray-400"}`}>
                            {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </span>
                        )}
                        {overdueTasks > 0 && <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12} /> {overdueTasks} overdue tasks</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    <button onClick={() => startEdit(project)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(project.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Progress</span><span className="text-xs font-medium text-elvion-primary">{progress}%</span></div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-elvion-primary rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-white/5">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-white/5 px-5">
                    {[
                      { key: "tasks", label: `Tasks (${project.tasks.length})` },
                      { key: "team", label: `Team (${project.members.length})` },
                      { key: "budget", label: "Budget & Timeline" },
                    ].map(t => (
                      <button key={t.key} onClick={() => setActiveTab(prev => ({ ...prev, [project.id]: t.key }))}
                        className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? "border-elvion-primary text-elvion-primary" : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {/* Tasks Tab */}
                    {tab === "tasks" && (
                      <div>
                        {project.tasks.length === 0 ? (
                          <p className="text-gray-500 text-sm text-center py-4">No tasks yet. Go to Tasks page to create tasks for this project.</p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead><tr className="text-left text-gray-500 text-xs">
                                <th className="pb-2 font-medium">Task</th>
                                <th className="pb-2 font-medium">Assignee</th>
                                <th className="pb-2 font-medium">Status</th>
                                <th className="pb-2 font-medium">Priority</th>
                                <th className="pb-2 font-medium">Timeline</th>
                                <th className="pb-2 font-medium">Hours</th>
                                <th className="pb-2 font-medium">Budget</th>
                              </tr></thead>
                              <tbody>
                                {project.tasks.map(task => {
                                  const taskOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";
                                  return (
                                    <tr key={task.id} className="border-t border-gray-100 dark:border-white/5">
                                      <td className="py-2 pr-3"><p className="font-medium text-gray-900 dark:text-white">{task.title}</p></td>
                                      <td className="py-2 pr-3 text-xs text-gray-500">{task.assignee?.name || <span className="text-gray-400 italic">Unassigned</span>}</td>
                                      <td className="py-2 pr-3"><span className={`text-[10px] px-2 py-0.5 rounded-full ${getTaskStatusColor(task.status)}`}>{taskStatusLabels[task.status]}</span></td>
                                      <td className="py-2 pr-3"><div className="flex items-center gap-1"><div className={`w-1.5 h-1.5 rounded-full ${getPriorityDot(task.priority)}`}></div><span className="text-xs text-gray-500">{task.priority}</span></div></td>
                                      <td className="py-2 pr-3 text-xs">
                                        {task.startDate && <span className="text-gray-400">{new Date(task.startDate).toLocaleDateString()} → </span>}
                                        {task.dueDate ? <span className={taskOverdue ? "text-red-400 font-medium" : "text-gray-500"}>{new Date(task.dueDate).toLocaleDateString()}</span> : <span className="text-gray-400">—</span>}
                                      </td>
                                      <td className="py-2 pr-3 text-xs text-gray-500">{task.estimatedHours ? `${task.actualHours || 0}/${task.estimatedHours}h` : "—"}</td>
                                      <td className="py-2 text-xs text-gray-500">{task.budget ? `$${task.budget.toLocaleString()}` : "—"}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Team Tab */}
                    {tab === "team" && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {/* Owner */}
                        <div className="p-3 rounded-lg border border-elvion-primary/30 bg-elvion-primary/5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary text-xs font-bold">{project.owner.name?.charAt(0) || "?"}</div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{project.owner.name}</p>
                              <p className="text-[10px] text-elvion-primary font-medium">Owner</p>
                            </div>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{project.owner.email}</p>
                          {/* Task count for owner */}
                          <p className="text-[10px] text-gray-500 mt-1">{project.tasks.filter(t => t.assignee?.id === project.owner.id).length} tasks assigned</p>
                        </div>
                        {/* Members */}
                        {project.members.map(m => (
                          <div key={m.id} className="p-3 rounded-lg border border-gray-200 dark:border-white/10 hover:border-elvion-primary/20 transition-colors">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs font-bold">{m.user.name?.charAt(0) || "?"}</div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{m.user.name}</p>
                                <p className="text-[10px] text-gray-400 capitalize">{m.role}</p>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1">{m.user.email}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{project.tasks.filter(t => t.assignee?.id === m.user.id).length} tasks assigned</p>
                          </div>
                        ))}
                        {project.members.length === 0 && <p className="text-sm text-gray-400 col-span-full">No team members added yet. Edit the project to add members.</p>}
                      </div>
                    )}

                    {/* Budget & Timeline Tab */}
                    {tab === "budget" && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50">
                            <p className="text-[10px] text-gray-500 uppercase">Project Budget</p>
                            <p className="text-lg font-bold text-elvion-primary">${(project.budget || 0).toLocaleString()}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50">
                            <p className="text-[10px] text-gray-500 uppercase">Task Budgets Total</p>
                            <p className="text-lg font-bold text-yellow-400">${taskBudget.toLocaleString()}</p>
                            {project.budget > 0 && <p className="text-[10px] text-gray-400">{Math.round((taskBudget / project.budget) * 100)}% of project budget</p>}
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50">
                            <p className="text-[10px] text-gray-500 uppercase">Est. Hours</p>
                            <p className="text-lg font-bold text-blue-400">{taskEstHours}h</p>
                            <p className="text-[10px] text-gray-400">{taskActHours}h actual worked</p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-elvion-dark/50">
                            <p className="text-[10px] text-gray-500 uppercase">Duration</p>
                            {project.startDate && project.endDate ? (
                              <>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">{Math.ceil((new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</p>
                                <p className="text-[10px] text-gray-400">{new Date(project.startDate).toLocaleDateString()} — {new Date(project.endDate).toLocaleDateString()}</p>
                              </>
                            ) : <p className="text-sm text-gray-400">No dates set</p>}
                          </div>
                        </div>

                        {/* Budget per employee */}
                        {project.tasks.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Budget by Team Member</h4>
                            <div className="space-y-2">
                              {(() => {
                                const byAssignee: Record<string, { name: string; budget: number; hours: number; tasks: number }> = {};
                                project.tasks.forEach(t => {
                                  const key = t.assignee?.name || "Unassigned";
                                  if (!byAssignee[key]) byAssignee[key] = { name: key, budget: 0, hours: 0, tasks: 0 };
                                  byAssignee[key].budget += t.budget || 0;
                                  byAssignee[key].hours += t.estimatedHours || 0;
                                  byAssignee[key].tasks += 1;
                                });
                                return Object.values(byAssignee).sort((a, b) => b.budget - a.budget).map((a, i) => (
                                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-elvion-dark/30 text-sm">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-elvion-primary/10 flex items-center justify-center text-[10px] font-bold text-elvion-primary">{a.name.charAt(0)}</div>
                                      <span className="text-gray-900 dark:text-white">{a.name}</span>
                                      <span className="text-[10px] text-gray-400">{a.tasks} tasks</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                      {a.hours > 0 && <span>{a.hours}h</span>}
                                      <span className="text-elvion-primary font-medium">${a.budget.toLocaleString()}</span>
                                    </div>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No projects found</div>}
    </div>
  );
}
