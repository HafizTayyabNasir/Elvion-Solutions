"use client";
import React from "react";
import { Users, CheckSquare, DollarSign, Timer, Calendar, AlertCircle, Edit2, Trash2, ChevronDown, ChevronRight, Banknote, UserPlus } from "lucide-react";

export default function ProjectDetails({ project, employeeOptions, onEdit, onDelete }) {
  if (!project) return null;
  // ...existing code...
  // Copy the expanded project JSX from Projects page here
  // For brevity, only the header and stats are shown. You should copy the full expanded JSX for all tabs.
  const progress = project.progress || 0;
  const daysLeft = project.endDate ? Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;
  return (
    <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-elvion-primary/10 mt-0.5">
              <ChevronDown size={16} className="text-elvion-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{project.name}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">{project.status}</span>
                <div className="w-2 h-2 rounded-full bg-blue-400" title={project.priority}></div>
              </div>
              {project.description && <p className="text-sm text-gray-500 mt-1 line-clamp-1">{project.description}</p>}
              <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-gray-500">
                <span className="flex items-center gap-1"><Users size={12} /> {project.members?.length || 0} members</span>
                <span className="flex items-center gap-1"><CheckSquare size={12} /> {project.tasks?.filter(t => t.status === "done").length || 0}/{project.tasks?.length || 0} tasks</span>
                {project.budget != null && project.budget > 0 && <span className="flex items-center gap-1 text-elvion-primary"><DollarSign size={12} /> {project.budget.toLocaleString()}</span>}
                {project.startDate && <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(project.startDate).toLocaleDateString()}</span>}
                {daysLeft !== null && (
                  <span className={`flex items-center gap-1 ${daysLeft < 0 ? "text-red-400 font-medium" : daysLeft < 7 ? "text-yellow-400" : "text-gray-400"}`}>
                    {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit && onEdit(project)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={14} /></button>
            <button onClick={() => onDelete && onDelete(project.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1"><span className="text-xs text-gray-500">Progress</span><span className="text-xs font-medium text-elvion-primary">{progress}%</span></div>
          <div className="w-full h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-elvion-primary rounded-full transition-all" style={{ width: `${progress}%` }}></div></div>
        </div>
      </div>
      {/* Add tabs and details as in Projects page */}
    </div>
  );
}
