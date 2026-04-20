"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { FolderOpen, Search, Users, Calendar, DollarSign, ChevronDown } from "lucide-react";

interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  priority: string;
  budget?: number;
  progress: number;
  startDate?: string;
  endDate?: string;
  contactId?: number;
  contact?: { id: number; name: string; email: string; company?: string };
  members: { id: number; user: { id: number; name: string } }[];
  tasks: { id: number; status: string }[];
}

const statusLabels: Record<string, string> = { active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled" };
const priorityLabels: Record<string, string> = { low: "Low", medium: "Medium", high: "High", urgent: "Urgent" };

const getStatusColor = (s: string) => {
  const c: Record<string, string> = {
    active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400",
    on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
    completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  };
  return c[s] || "bg-gray-100 text-gray-700";
};

const getPriorityDot = (p: string) => {
  const c: Record<string, string> = { low: "bg-gray-400", medium: "bg-blue-400", high: "bg-orange-400", urgent: "bg-red-500" };
  return c[p] || "bg-gray-400";
};

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchAPI("/projects")
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.contact?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (p.contact?.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    completed: projects.filter((p) => p.status === "completed").length,
    totalBudget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
        <p className="text-gray-500 mt-1">View and manage all projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Projects</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Active</p>
          <p className="text-lg font-bold text-green-500">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Completed</p>
          <p className="text-lg font-bold text-blue-500">{stats.completed}</p>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-3 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Budget</p>
          <p className="text-lg font-bold text-elvion-primary">${stats.totalBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects by name, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Projects List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
          <FolderOpen size={40} className="mx-auto mb-3 opacity-40" />
          <p>{search || statusFilter ? "No projects match your filters." : "No projects found."}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((project) => {
            const doneTasks = project.tasks?.filter((t) => t.status === "done").length || 0;
            const totalTasks = project.tasks?.length || 0;
            const progress = project.progress || (totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0);
            const clientLink = project.contactId ? `/admin/clients/${project.contactId}` : null;
            const projectLink = project.contactId
              ? `/admin/clients/${project.contactId}/projects/${project.id}`
              : `/admin/projects/${project.id}`;

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:shadow-lg transition-shadow hover:border-elvion-primary/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={projectLink} className="hover:text-elvion-primary transition-colors">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{project.name}</h3>
                      </Link>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                        {statusLabels[project.status] || project.status}
                      </span>
                      <div className={`w-2 h-2 rounded-full ${getPriorityDot(project.priority)}`} title={priorityLabels[project.priority] || project.priority}></div>
                    </div>

                    {project.contact && (
                      <Link href={clientLink || "#"} className="inline-flex items-center gap-1 mt-1 text-sm text-gray-500 hover:text-elvion-primary">
                        <Users size={12} />
                        {project.contact.name}
                        {project.contact.company && <span className="text-gray-400">({project.contact.company})</span>}
                      </Link>
                    )}

                    {project.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{project.description}</p>}

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {project.members?.length || 0} members
                      </span>
                      <span>{doneTasks}/{totalTasks} tasks</span>
                      {project.budget && project.budget > 0 && (
                        <span className="flex items-center gap-1 text-elvion-primary font-medium">
                          <DollarSign size={12} /> {project.budget.toLocaleString()}
                        </span>
                      )}
                      {project.startDate && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(project.startDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-elvion-primary">{progress}%</p>
                    <p className="text-[10px] text-gray-500 uppercase">Progress</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-elvion-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Link
                    href={projectLink}
                    className="text-sm text-elvion-primary hover:underline font-medium"
                  >
                    View Project →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
