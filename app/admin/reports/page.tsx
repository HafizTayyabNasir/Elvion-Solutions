"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { BarChart3, TrendingUp, Users, FolderOpen, Ticket, DollarSign, FileText, Target } from "lucide-react";

interface Stats {
  users: number; projects: number; tasks: number; tickets: number;
  invoices: number; leads: number; deals: number; revenue: number;
  openTickets: number; activeTasks: number; activeProjects: number;
  wonDeals: number; pipelineValue: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<Stats>({ users: 0, projects: 0, tasks: 0, tickets: 0, invoices: 0, leads: 0, deals: 0, revenue: 0, openTickets: 0, activeTasks: 0, activeProjects: 0, wonDeals: 0, pipelineValue: 0 });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<{ id: number; action: string; entityType: string; description: string; createdAt: string; user: { name: string } }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, projects, tasks, tickets, invoices, leads, deals] = await Promise.all([
          fetchAPI("/users").catch(() => []),
          fetchAPI("/projects").catch(() => []),
          fetchAPI("/tasks").catch(() => []),
          fetchAPI("/tickets").catch(() => []),
          fetchAPI("/invoices").catch(() => []),
          fetchAPI("/crm/leads").catch(() => []),
          fetchAPI("/crm/deals").catch(() => []),
        ]);

        setStats({
          users: users.length || 0,
          projects: projects.length || 0,
          tasks: tasks.length || 0,
          tickets: tickets.length || 0,
          invoices: invoices.length || 0,
          leads: leads.length || 0,
          deals: deals.length || 0,
          revenue: (invoices || []).filter((i: { status: string }) => i.status === "paid").reduce((s: number, i: { total: number }) => s + (i.total || 0), 0),
          openTickets: (tickets || []).filter((t: { status: string }) => t.status === "open").length,
          activeTasks: (tasks || []).filter((t: { status: string }) => t.status === "in_progress").length,
          activeProjects: (projects || []).filter((p: { status: string }) => p.status === "active").length,
          wonDeals: (deals || []).filter((d: { stage: string }) => d.stage === "closed_won").length,
          pipelineValue: (deals || []).filter((d: { stage: string }) => !d.stage?.startsWith("closed")).reduce((s: number, d: { value: number }) => s + (d.value || 0), 0),
        });
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchStats();
  }, []);

  const kpis = [
    { label: "Total Users", value: stats.users, icon: Users, color: "blue" },
    { label: "Active Projects", value: stats.activeProjects, icon: FolderOpen, color: "green" },
    { label: "Open Tickets", value: stats.openTickets, icon: Ticket, color: "orange" },
    { label: "Active Tasks", value: stats.activeTasks, icon: BarChart3, color: "purple" },
    { label: "Total Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, color: "green" },
    { label: "Pipeline Value", value: `$${stats.pipelineValue.toLocaleString()}`, icon: TrendingUp, color: "blue" },
    { label: "Total Leads", value: stats.leads, icon: Target, color: "orange" },
    { label: "Deals Won", value: stats.wonDeals, icon: FileText, color: "green" },
  ];

  const colorMap: Record<string, string> = { blue: "bg-blue-100 dark:bg-blue-500/20 text-blue-500", green: "bg-green-100 dark:bg-green-500/20 text-green-500", orange: "bg-orange-100 dark:bg-orange-500/20 text-orange-500", purple: "bg-purple-100 dark:bg-purple-500/20 text-purple-500" };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1><p className="text-gray-500 mt-1">Overview of your business metrics</p></div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorMap[kpi.color]}`}><kpi.icon size={18} /></div>
              <div><p className="text-sm text-gray-500">{kpi.label}</p><p className="text-xl font-bold text-gray-900 dark:text-white">{kpi.value}</p></div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projects Summary */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Projects Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Projects</span><span className="font-medium text-gray-900 dark:text-white">{stats.projects}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Active</span><span className="font-medium text-green-500">{stats.activeProjects}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Tasks</span><span className="font-medium text-gray-900 dark:text-white">{stats.tasks}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">In Progress Tasks</span><span className="font-medium text-blue-500">{stats.activeTasks}</span></div>
          </div>
        </div>

        {/* CRM Summary */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">CRM Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Leads</span><span className="font-medium text-gray-900 dark:text-white">{stats.leads}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Deals</span><span className="font-medium text-gray-900 dark:text-white">{stats.deals}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Deals Won</span><span className="font-medium text-green-500">{stats.wonDeals}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Pipeline Value</span><span className="font-medium text-elvion-primary">${stats.pipelineValue.toLocaleString()}</span></div>
          </div>
        </div>

        {/* Support Summary */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Tickets</span><span className="font-medium text-gray-900 dark:text-white">{stats.tickets}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Open Tickets</span><span className="font-medium text-orange-500">{stats.openTickets}</span></div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Financial Overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Invoices</span><span className="font-medium text-gray-900 dark:text-white">{stats.invoices}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-gray-500">Total Revenue</span><span className="font-medium text-elvion-primary">${stats.revenue.toLocaleString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
