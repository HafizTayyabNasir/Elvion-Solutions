"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { ArrowLeft, CheckCircle, Clock, FileText, Users } from "lucide-react";

interface Task { id: number; title: string; status: string; priority: string; dueDate: string; assignee: { name: string } | null; }
interface ProjectDetail {
  id: number; name: string; description: string; status: string; priority: string; progress: number;
  startDate: string; endDate: string; budget: number;
  owner: { name: string; email: string };
  members: Array<{ user: { name: string; email: string }; role: string }>;
  tasks: Task[];
  _count: { tasks: number; invoices: number; files: number };
}

export default function ProjectDetailPage() {
  const params = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI(`/projects/${params.id}`).then(setProject).catch(console.error).finally(() => setLoading(false));
  }, [params.id]);

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { active: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", completed: "bg-blue-100 text-blue-700", on_hold: "bg-yellow-100 text-yellow-700", cancelled: "bg-red-100 text-red-700", todo: "bg-gray-100 text-gray-700", in_progress: "bg-blue-100 text-blue-700", review: "bg-purple-100 text-purple-700", done: "bg-green-100 text-green-700" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;
  if (!project) return <div className="text-center py-16 text-gray-500">Project not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer/projects" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(project.status)}`}>{project.status.replace("_", " ")}</span>
            <span className="text-sm text-gray-500">Priority: {project.priority}</span>
          </div>
        </div>
      </div>

      {project.description && (
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h2>
          <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Progress</h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{project.progress}%</p>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-elvion-primary h-2 rounded-full" style={{ width: `${project.progress}%` }}></div>
          </div>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Timeline</h3>
          <p className="text-sm text-gray-900 dark:text-white">{project.startDate ? new Date(project.startDate).toLocaleDateString() : "TBD"} — {project.endDate ? new Date(project.endDate).toLocaleDateString() : "TBD"}</p>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Budget</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{project.budget ? `$${project.budget.toLocaleString()}` : "N/A"}</p>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Users size={18} /> Team</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold">{project.owner?.name?.charAt(0) || "O"}</div>
            <div><p className="font-medium text-gray-900 dark:text-white">{project.owner?.name}</p><p className="text-xs text-gray-500">Project Owner</p></div>
          </div>
          {project.members?.map((m, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">{m.user?.name?.charAt(0) || "M"}</div>
              <div><p className="font-medium text-gray-900 dark:text-white">{m.user?.name}</p><p className="text-xs text-gray-500">{m.role}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Tasks */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><CheckCircle size={18} /> Tasks ({project._count?.tasks || 0})</h2>
        {project.tasks?.length > 0 ? (
          <div className="space-y-2">
            {project.tasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(task.status)}`}>{task.status.replace("_", " ")}</span>
                    {task.assignee && <span className="text-xs text-gray-500">{task.assignee.name}</span>}
                  </div>
                </div>
                {task.dueDate && <span className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12} /> {new Date(task.dueDate).toLocaleDateString()}</span>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No tasks yet</p>
        )}
      </div>
    </div>
  );
}
