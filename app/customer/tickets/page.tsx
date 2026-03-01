"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { Ticket, Plus, Clock, MessageSquare } from "lucide-react";

interface TicketItem {
  id: number; subject: string; status: string; priority: string; category: string; createdAt: string;
  _count: { responses: number };
  assignee: { name: string } | null;
}

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAPI("/tickets").then(setTickets).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? tickets : tickets.filter(t => t.status === filter);

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { open: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", resolved: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", closed: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (p: string) => {
    const c: Record<string, string> = { urgent: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };
    return c[p] || "bg-gray-100 text-gray-700";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
          <p className="text-gray-500 mt-1">Get help from our team</p>
        </div>
        <Link href="/customer/tickets/new" className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition-colors">
          <Plus size={18} /> New Ticket
        </Link>
      </div>

      <div className="flex gap-2 flex-wrap">
        {["all", "open", "in_progress", "resolved", "closed"].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-white/10"}`}>
            {f === "all" ? "All" : f.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10">
          <Ticket size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">No tickets found</p>
          <Link href="/customer/tickets/new" className="inline-flex items-center gap-2 mt-4 text-elvion-primary hover:underline"><Plus size={16} /> Create your first ticket</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(ticket => (
            <Link key={ticket.id} href={`/customer/tickets/${ticket.id}`} className="block bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">#{ticket.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>{ticket.status.replace("_", " ")}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                    {ticket.category && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{ticket.category}</span>}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.subject}</h3>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1"><MessageSquare size={14} /> {ticket._count?.responses || 0}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              {ticket.assignee && <p className="text-xs text-gray-500 mt-2">Assigned to: {ticket.assignee.name}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
