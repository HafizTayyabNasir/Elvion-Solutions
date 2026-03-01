"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Plus, X, Edit2, Trash2, FolderOpen, Users, Calendar, DollarSign } from "lucide-react";

interface Project {
  id: number; name: string; description: string; status: string; priority: string;
  startDate: string; endDate: string; budget: number; progress: number;
  owner: { id: number; name: string; email: string };
  members: { user: { id: number; name: string; email: string }; role: string }[];
  _count: { tasks: number; invoices: number; files: number };
  tasks: { id: number; status: string }[];
}

const statusOptions = ["active", "on_hold", "completed", "cancelled"];
const priorityOptions = ["low", "medium", "high", "urgent"];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", status: "active", priority: "medium", startDate: "", endDate: "", budget: "", clientId: "" });

  const fetchData = () => {
    Promise.all([
      fetchAPI("/projects"),
      fetchAPI("/users").catch(() => []),
    ]).then(([p, u]) => { setProjects(p); setUsers(u); }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, budget: form.budget ? parseFloat(form.budget) : null, clientId: form.clientId ? parseInt(form.clientId) : null };
    try {
      if (editId) { await fetchAPI(`/projects/${editId}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await fetchAPI("/projects", { method: "POST", body: JSON.stringify(body) }); }
      setShowForm(false); setEditId(null);
      setForm({ name: "", description: "", status: "active", priority: "medium", startDate: "", endDate: "", budget: "", clientId: "" });
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    try { await fetchAPI(`/projects/${id}`, { method: "DELETE" }); fetchData(); } catch (err) { console.error(err); }
  };

  const startEdit = (p: Project) => {
    setForm({ name: p.name, description: p.description || "", status: p.status, priority: p.priority || "medium", startDate: p.startDate ? p.startDate.split("T")[0] : "", endDate: p.endDate ? p.endDate.split("T")[0] : "", budget: p.budget?.toString() || "", clientId: "" });
    setEditId(p.id); setShowForm(true);
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (p: string) => {
    const c: Record<string, string> = { low: "text-gray-400", medium: "text-blue-400", high: "text-orange-400", urgent: "text-red-500" };
    return c[p] || "text-gray-400";
  };

  const calcProgress = (tasks: { status: string }[]) => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter(t => t.status === "done" || t.status === "completed").length / tasks.length) * 100);
  };

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1><p className="text-gray-500 mt-1">Manage all client projects</p></div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", description: "", status: "active", priority: "medium", startDate: "", endDate: "", budget: "", clientId: "" }); }}
          className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> New Project</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...statusOptions].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium ${filterStatus === s ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-500 border border-gray-200 dark:border-white/10"}`}>
              {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-gray-500 mb-1">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm text-gray-500 mb-1">Description</label><textarea rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{statusOptions.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{priorityOptions.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">End Date</label><input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Budget ($)</label><input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Client</label><select value={form.clientId} onChange={e => setForm({ ...form, clientId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"><option value="">None</option>{users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90">{editId ? "Update Project" : "Create Project"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(project => {
          const progress = project.progress || calcProgress(project.tasks);
          return (
            <div key={project.id} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:border-elvion-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-elvion-primary/10"><FolderOpen size={16} className="text-elvion-primary" /></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>{project.status.replace("_", " ")}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => startEdit(project)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(project.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
              {project.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.description}</p>}
              
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Progress</span><span className="text-xs font-medium text-gray-900 dark:text-white">{progress}%</span></div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-elvion-primary rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Users size={12} /> {project.members?.length || 0}</span>
                <span className={getPriorityColor(project.priority)}>{project.priority}</span>
                {project.budget && <span className="flex items-center gap-1"><DollarSign size={12} /> {project.budget.toLocaleString()}</span>}
              </div>
              <div className="mt-2 flex items-center gap-3 text-[10px] text-gray-400">
                {project.startDate && <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(project.startDate).toLocaleDateString()}</span>}
                <span>{project._count.tasks} tasks</span>
                <span>{project._count.invoices} invoices</span>
              </div>
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No projects found</div>}
    </div>
  );
}
