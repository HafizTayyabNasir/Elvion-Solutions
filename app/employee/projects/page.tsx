"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  BarChart3,
  ListTodo,
  Pause,
  Search,
} from "lucide-react";

interface ProjectTask {
  id: number;
  status: string;
  title: string;
  priority: string;
  dueDate: string | null;
}

interface ProjectMember {
  id: number;
  role: string;
  user: { id: number; name: string | null; email: string };
}

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  startDate: string | null;
  endDate: string | null;
  budget: number | null;
  progress: number;
  owner: { id: number; name: string | null; email: string };
  members: ProjectMember[];
  tasks: ProjectTask[];
  _count: { tasks: number; invoices: number; files: number };
  myRole: string;
  myTaskCount: number;
  myTasksDone: number;
  myTasksPending: number;
  createdAt: string;
  updatedAt: string;
}

interface Summary {
  total: number;
  active: number;
  completed: number;
  onHold: number;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof FolderOpen }> = {
  active: { label: "Active", color: "text-green-400", bg: "bg-green-500/20 text-green-400", icon: FolderOpen },
  on_hold: { label: "On Hold", color: "text-yellow-400", bg: "bg-yellow-500/20 text-yellow-400", icon: Pause },
  completed: { label: "Completed", color: "text-blue-400", bg: "bg-blue-500/20 text-blue-400", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/20 text-red-400", icon: AlertCircle },
};

const priorityColors: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-blue-400",
  high: "text-orange-400",
  urgent: "text-red-400",
};

const roleLabels: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  member: "Member",
  client: "Client",
};

export default function EmployeeProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<Summary>({ total: 0, active: 0, completed: 0, onHold: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/employee/projects?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load projects");
      const data = await res.json();
      setProjects(data.projects);
      setSummary(data.summary);
    } catch {
      console.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-2xl lg:text-3xl font-bold text-white">My Projects</h1>
        <p className="text-gray-400 text-sm mt-1">Projects you&apos;re assigned to and your contributions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Projects", value: summary.total, icon: FolderOpen, color: "text-white", bg: "bg-white/5" },
          { label: "Active", value: summary.active, icon: Clock, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Completed", value: summary.completed, icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "On Hold", value: summary.onHold, icon: Pause, color: "text-yellow-400", bg: "bg-yellow-500/10" },
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
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search projects..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setLoading(true); }}
          className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-elvion-card border border-white/10 rounded-xl">
          <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Projects Found</h3>
          <p className="text-gray-500 text-sm">You haven&apos;t been assigned to any projects yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((project) => {
            const cfg = statusConfig[project.status] || statusConfig.active;
            const isExpanded = expandedId === project.id;
            return (
              <div key={project.id}
                className="bg-elvion-card rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                {/* Project Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">{project.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${cfg.bg}`}>{cfg.label}</span>
                      </div>
                      {project.description && (
                        <p className="text-sm text-gray-400 line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-elvion-primary font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-elvion-primary rounded-full transition-all"
                        style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white/5 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-white">{project.myTaskCount}</p>
                      <p className="text-xs text-gray-400">My Tasks</p>
                    </div>
                    <div className="bg-green-500/10 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-green-400">{project.myTasksDone}</p>
                      <p className="text-xs text-gray-400">Completed</p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-lg p-2.5 text-center">
                      <p className="text-lg font-bold text-yellow-400">{project.myTasksPending}</p>
                      <p className="text-xs text-gray-400">Pending</p>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {project.members.length + 1} members
                    </span>
                    <span className="flex items-center gap-1">
                      <ListTodo size={12} /> {project._count.tasks} total tasks
                    </span>
                    <span className={`flex items-center gap-1 ${priorityColors[project.priority] || "text-gray-400"}`}>
                      <BarChart3 size={12} /> {project.priority}
                    </span>
                    <span className="flex items-center gap-1 bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-full">
                      {roleLabels[project.myRole] || project.myRole}
                    </span>
                  </div>
                </div>

                {/* Expand/Collapse */}
                <div className="border-t border-white/5">
                  <button onClick={() => setExpandedId(isExpanded ? null : project.id)}
                    className="w-full px-5 py-2.5 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center justify-center gap-1">
                    {isExpanded ? "Hide details" : "Show details"}
                    <ArrowRight size={12} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-5 space-y-4">
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Start Date</p>
                        <p className="text-gray-300 flex items-center gap-1">
                          <Calendar size={13} />
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : "Not set"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">End Date</p>
                        <p className="text-gray-300 flex items-center gap-1">
                          <Calendar size={13} />
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : "Not set"}
                        </p>
                      </div>
                    </div>

                    {/* Owner */}
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Project Owner</p>
                      <p className="text-sm text-gray-300">{project.owner.name || project.owner.email}</p>
                    </div>

                    {/* Team */}
                    <div>
                      <p className="text-xs text-gray-500 mb-2">Team Members</p>
                      <div className="flex flex-wrap gap-2">
                        {project.members.map(m => (
                          <span key={m.id} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 bg-white/5 rounded-full text-gray-300">
                            <span className="w-5 h-5 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary text-[10px] font-bold">
                              {(m.user.name || m.user.email).charAt(0).toUpperCase()}
                            </span>
                            {m.user.name || m.user.email}
                            <span className="text-gray-500">({roleLabels[m.role] || m.role})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* My Tasks in this project */}
                    {project.tasks.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2">My Tasks in This Project</p>
                        <div className="space-y-1.5">
                          {project.tasks.map(t => (
                            <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-sm">
                              <div className="flex items-center gap-2">
                                {t.status === "done" ? (
                                  <CheckCircle2 size={14} className="text-green-400" />
                                ) : (
                                  <Clock size={14} className="text-gray-400" />
                                )}
                                <span className={t.status === "done" ? "text-gray-500 line-through" : "text-gray-300"}>
                                  {t.title}
                                </span>
                              </div>
                              <span className={`text-xs ${priorityColors[t.priority] || "text-gray-400"}`}>
                                {t.priority}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* View Tasks Link */}
                    <Link href="/employee/tasks"
                      className="inline-flex items-center gap-1.5 text-sm text-elvion-primary hover:underline">
                      View all tasks <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
