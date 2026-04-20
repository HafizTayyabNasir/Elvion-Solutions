"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { FolderKanban, Clock, Users, CheckCircle } from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  startDate: string;
  endDate: string;
  _count: { tasks: number; invoices: number; files: number };
  owner: { name: string };
}

export default function CustomerProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAPI("/projects").then(setProjects).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? projects : projects.filter(p => p.status === filter);

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", completed: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", on_hold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (p: string) => {
    const c: Record<string, string> = { urgent: "text-red-500", high: "text-orange-500", medium: "text-yellow-500", low: "text-green-500" };
    return c[p] || "text-gray-500";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Projects</h1>
          <p className="text-gray-500 mt-1">Track your project progress</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "active", "on_hold", "completed", "cancelled"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"}`}>
            {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
          <FolderKanban size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No projects found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(project => (
            <Link key={project.id} href={`/customer/projects/${project.id}`} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                  {project.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>}
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>{project.status.replace("_", " ")}</span>
                  <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>{project.priority}</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Progress</span>
                  <span className="font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-elvion-primary h-2 rounded-full transition-all" style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1"><CheckCircle size={14} /> {project._count?.tasks || 0} tasks</div>
                {project.startDate && <div className="flex items-center gap-1"><Clock size={14} /> {new Date(project.startDate).toLocaleDateString()}</div>}
                {project.endDate && <div className="flex items-center gap-1"><Clock size={14} /> Due: {new Date(project.endDate).toLocaleDateString()}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
