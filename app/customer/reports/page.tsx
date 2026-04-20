"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { BarChart3, FolderKanban, Ticket, Receipt, TrendingUp } from "lucide-react";

interface ReportData {
  projects: { total: number; active: number; completed: number; onHold: number };
  tickets: { total: number; open: number; resolved: number; closed: number };
  invoices: { total: number; paid: number; pending: number; overdue: number; totalAmount: number; paidAmount: number };
}

export default function CustomerReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [projects, tickets, invoices] = await Promise.all([
          fetchAPI("/projects").catch(() => []),
          fetchAPI("/tickets").catch(() => []),
          fetchAPI("/invoices").catch(() => []),
        ]);
        const p = Array.isArray(projects) ? projects : [];
        const t = Array.isArray(tickets) ? tickets : [];
        const inv = Array.isArray(invoices) ? invoices : [];
        setData({
          projects: { total: p.length, active: p.filter((x: {status:string}) => x.status === "active").length, completed: p.filter((x: {status:string}) => x.status === "completed").length, onHold: p.filter((x: {status:string}) => x.status === "on_hold").length },
          tickets: { total: t.length, open: t.filter((x: {status:string}) => x.status === "open").length, resolved: t.filter((x: {status:string}) => x.status === "resolved").length, closed: t.filter((x: {status:string}) => x.status === "closed").length },
          invoices: { total: inv.length, paid: inv.filter((x: {status:string}) => x.status === "paid").length, pending: inv.filter((x: {status:string}) => x.status === "sent").length, overdue: inv.filter((x: {status:string}) => x.status === "overdue").length, totalAmount: inv.reduce((s: number, x: {total: number}) => s + x.total, 0), paidAmount: inv.filter((x: {status:string}) => x.status === "paid").reduce((s: number, x: {total: number}) => s + x.total, 0) },
        });
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  const d = data!;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <p className="text-gray-500 mt-1">Overview of your account activity</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects Report */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center"><FolderKanban className="w-5 h-5 text-blue-500" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total", value: d.projects.total, color: "text-gray-900 dark:text-white" },
              { label: "Active", value: d.projects.active, color: "text-green-500" },
              { label: "Completed", value: d.projects.completed, color: "text-blue-500" },
              { label: "On Hold", value: d.projects.onHold, color: "text-yellow-500" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets Report */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center"><Ticket className="w-5 h-5 text-purple-500" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Support Tickets</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total", value: d.tickets.total, color: "text-gray-900 dark:text-white" },
              { label: "Open", value: d.tickets.open, color: "text-blue-500" },
              { label: "Resolved", value: d.tickets.resolved, color: "text-green-500" },
              { label: "Closed", value: d.tickets.closed, color: "text-gray-500" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoices Report */}
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center"><Receipt className="w-5 h-5 text-emerald-500" /></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoices</h2>
          </div>
          <div className="space-y-3">
            {[
              { label: "Total", value: d.invoices.total, color: "text-gray-900 dark:text-white" },
              { label: "Paid", value: d.invoices.paid, color: "text-green-500" },
              { label: "Pending", value: d.invoices.pending, color: "text-yellow-500" },
              { label: "Overdue", value: d.invoices.overdue, color: "text-red-500" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{item.label}</span>
                <span className={`font-semibold ${item.color}`}>{item.value}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-200 dark:border-white/10 space-y-2">
              <div className="flex justify-between"><span className="text-sm text-gray-500">Total Amount</span><span className="font-bold text-gray-900 dark:text-white">${d.invoices.totalAmount.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-sm text-gray-500">Paid Amount</span><span className="font-bold text-green-500">${d.invoices.paidAmount.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
