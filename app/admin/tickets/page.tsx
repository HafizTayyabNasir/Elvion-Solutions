"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Plus, X, Edit2, Trash2, MessageSquare, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface Ticket {
  id: number; subject: string; description: string; status: string; priority: string;
  category: string; user: { id: number; name: string; email: string };
  _count?: { responses: number }; createdAt: string; updatedAt: string;
}

const statusOptions = ["open", "in_progress", "resolved", "closed"];
const priorityOptions = ["low", "medium", "high", "urgent"];
const categoryOptions = ["general", "technical", "billing", "feature_request", "bug"];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responses, setResponses] = useState<{ id: number; message: string; isStaff: boolean; user: { name: string }; createdAt: string }[]>([]);
  const [reply, setReply] = useState("");

  const fetchTickets = () => {
    fetchAPI("/tickets").then(setTickets).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTickets(); }, []);

  const openTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await fetchAPI(`/tickets/${ticket.id}/responses`);
      setResponses(res);
    } catch { setResponses([]); }
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    try {
      await fetchAPI(`/tickets/${selectedTicket.id}/responses`, { method: "POST", body: JSON.stringify({ message: reply }) });
      setReply("");
      const res = await fetchAPI(`/tickets/${selectedTicket.id}/responses`);
      setResponses(res);
      fetchTickets();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await fetchAPI(`/tickets/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      fetchTickets();
      if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status });
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this ticket?")) return;
    try { await fetchAPI(`/tickets/${id}`, { method: "DELETE" }); if (selectedTicket?.id === id) setSelectedTicket(null); fetchTickets(); } catch (err) { console.error(err); }
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { open: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", in_progress: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", resolved: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", closed: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const getPriorityColor = (p: string) => {
    const c: Record<string, string> = { low: "text-gray-400", medium: "text-blue-400", high: "text-orange-500", urgent: "text-red-500" };
    return c[p] || "text-gray-400";
  };

  const getStatusIcon = (s: string) => {
    if (s === "resolved") return <CheckCircle size={14} className="text-green-500" />;
    if (s === "in_progress") return <Clock size={14} className="text-yellow-500" />;
    if (s === "closed") return <CheckCircle size={14} className="text-gray-400" />;
    return <AlertCircle size={14} className="text-blue-500" />;
  };

  const filtered = tickets.filter(t => {
    const matchSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.user.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1><p className="text-gray-500 mt-1">Manage customer support requests</p></div>
        <div className="flex gap-3 text-sm">
          <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg">{tickets.filter(t => t.status === "open").length} Open</span>
          <span className="px-3 py-1 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 rounded-lg">{tickets.filter(t => t.status === "in_progress").length} In Progress</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...statusOptions].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium ${filterStatus === s ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-500 border border-gray-200 dark:border-white/10"}`}>
              {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6">
        {/* Tickets List */}
        <div className={`${selectedTicket ? "hidden lg:block lg:w-1/2" : "w-full"} space-y-3`}>
          {filtered.map(ticket => (
            <div key={ticket.id} onClick={() => openTicket(ticket)}
              className={`bg-white dark:bg-elvion-card rounded-xl border p-4 cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? "border-elvion-primary" : "border-gray-200 dark:border-white/10 hover:border-elvion-primary/30"}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(ticket.status)}
                    <h3 className="font-medium text-gray-900 dark:text-white text-sm">{ticket.subject}</h3>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1">{ticket.description}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={e => { e.stopPropagation(); handleDelete(ticket.id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>{ticket.status.replace("_", " ")}</span>
                <span className={`text-xs ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
                <span className="text-xs text-gray-400">{ticket.user.name}</span>
                <span className="text-xs text-gray-400 ml-auto flex items-center gap-1"><MessageSquare size={12} /> {ticket._count?.responses || 0}</span>
                <span className="text-[10px] text-gray-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No tickets found</div>}
        </div>

        {/* Ticket Detail */}
        {selectedTicket && (
          <div className="flex-1 bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-semibold text-gray-900 dark:text-white">{selectedTicket.subject}</h2>
                <button onClick={() => setSelectedTicket(null)} className="lg:hidden p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
              </div>
              <p className="text-sm text-gray-500 mb-3">{selectedTicket.description}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Status:</span>
                <select value={selectedTicket.status} onChange={e => updateStatus(selectedTicket.id, e.target.value)}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">
                  {statusOptions.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
                <span className="text-xs text-gray-400 ml-2">by {selectedTicket.user.name}</span>
              </div>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto space-y-3">
              {responses.map(r => (
                <div key={r.id} className={`p-3 rounded-lg text-sm ${r.isStaff ? "bg-elvion-primary/10 ml-8" : "bg-gray-50 dark:bg-elvion-dark/50 mr-8"}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-white text-xs">{r.user.name}</span>
                    {r.isStaff && <span className="text-[10px] px-1.5 py-0.5 bg-elvion-primary/20 text-elvion-primary rounded">Staff</span>}
                    <span className="text-[10px] text-gray-400 ml-auto">{new Date(r.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{r.message}</p>
                </div>
              ))}
              {responses.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No responses yet</p>}
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-white/5">
              <div className="flex gap-2">
                <input value={reply} onChange={e => setReply(e.target.value)} placeholder="Type your reply..." onKeyDown={e => e.key === "Enter" && sendReply()}
                  className="flex-1 p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white text-sm" />
                <button onClick={sendReply} className="px-4 py-2.5 bg-elvion-primary text-black rounded-lg font-semibold text-sm hover:bg-elvion-primary/90">Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
