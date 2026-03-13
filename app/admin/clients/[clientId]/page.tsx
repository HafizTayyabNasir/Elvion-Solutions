"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { ArrowLeft, Users, FolderOpen, Mail, Building2, Plus, X } from "lucide-react";

interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  priority: string;
  budget: number;
  progress: number;
  startDate: string;
  endDate: string;
  tasks: { id: number; status: string }[];
  members: { id: number; role: string }[];
}

const statusLabels: Record<string, string> = { active: "Active", on_hold: "On Hold", completed: "Completed", cancelled: "Cancelled" };

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

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.clientId as string;

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchAPI(`/crm/contacts/${clientId}`).catch(() => null),
      fetchAPI(`/projects?clientId=${clientId}`).catch(() => []),
    ]).then(([c, p]) => {
      setClient(c);
      setProjects(Array.isArray(p) ? p : []);
      setLoading(false);
    });
  }, [clientId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/admin/clients" className="hover:text-elvion-primary flex items-center gap-1">
          <ArrowLeft size={14} /> Clients
        </Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{client?.name || "Client"}</span>
      </div>

      {/* Client Info Header */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-xl">
            {client?.name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{client?.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
              {client?.email && (
                <span className="flex items-center gap-1">
                  <Mail size={14} /> {client.email}
                </span>
              )}
              {client?.company && (
                <span className="flex items-center gap-1">
                  <Building2 size={14} /> {client.company}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{projects.length} project(s)</p>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
            <FolderOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p>No projects found for this client.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => {
              const doneTasks = project.tasks?.filter((t) => t.status === "done").length || 0;
              const totalTasks = project.tasks?.length || 0;
              const progress = project.progress || (totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0);

              return (
                <Link
                  key={project.id}
                  href={`/admin/clients/${clientId}/projects/${project.id}`}
                  className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:shadow-lg transition-shadow hover:border-elvion-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <FolderOpen size={18} className="text-elvion-primary" />
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{project.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                          {statusLabels[project.status] || project.status}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getPriorityDot(project.priority)}`} title={project.priority}></div>
                      </div>
                      {project.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{project.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Users size={12} /> {project.members?.length || 0} members</span>
                        <span>{doneTasks}/{totalTasks} tasks done</span>
                        {project.budget > 0 && <span className="text-elvion-primary font-medium">${project.budget.toLocaleString()}</span>}
                        {project.startDate && <span>{new Date(project.startDate).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Progress</span>
                      <span className="text-xs font-medium text-elvion-primary">{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-elvion-primary rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
