"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Send, Clock } from "lucide-react";

interface Response { id: number; message: string; isStaff: boolean; createdAt: string; }
interface TicketDetail {
  id: number; subject: string; description: string; status: string; priority: string; category: string;
  creator: { name: string; email: string }; assignee: { name: string } | null;
  responses: Response[]; createdAt: string; updatedAt: string;
}

export default function TicketDetailPage() {
  const params = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const fetchTicket = () => {
    fetchAPI(`/tickets/${params.id}`).then(setTicket).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTicket(); }, [params.id]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      await fetchAPI(`/tickets/${params.id}/responses`, { method: "POST", body: JSON.stringify({ message: reply }) });
      setReply("");
      fetchTicket();
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { open: "bg-blue-100 text-blue-700", in_progress: "bg-yellow-100 text-yellow-700", resolved: "bg-green-100 text-green-700", closed: "bg-gray-100 text-gray-700" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;
  if (!ticket) return <div className="text-center py-16 text-gray-500">Ticket not found</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/customer/tickets" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"><ArrowLeft size={20} /></Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-400">#{ticket.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(ticket.status)}`}>{ticket.status.replace("_", " ")}</span>
            <span className="text-xs text-gray-400">{ticket.priority} priority</span>
            {ticket.category && <span className="text-xs text-gray-400">• {ticket.category}</span>}
          </div>
        </div>
      </div>

      {/* Original Message */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-sm">{ticket.creator?.name?.charAt(0) || "U"}</div>
          <div><p className="font-medium text-gray-900 dark:text-white text-sm">{ticket.creator?.name}</p><p className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</p></div>
        </div>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Responses */}
      {ticket.responses?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-500">Responses ({ticket.responses.length})</h3>
          {ticket.responses.map(r => (
            <div key={r.id} className={`rounded-xl border p-5 ${r.isStaff ? "bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20" : "bg-white dark:bg-elvion-card border-gray-200 dark:border-white/10"}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${r.isStaff ? "bg-blue-500 text-white" : "bg-elvion-primary/20 text-elvion-primary"}`}>
                  {r.isStaff ? "S" : "U"}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{r.isStaff ? "Support Team" : "You"}</span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={10} /> {new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm">{r.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {ticket.status !== "closed" && (
        <form onSubmit={handleReply} className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <textarea rows={3} value={reply} onChange={e => setReply(e.target.value)} placeholder="Write a reply..."
            className="w-full p-3 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white focus:border-elvion-primary outline-none resize-none mb-3" />
          <button type="submit" disabled={sending || !reply.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition-colors disabled:opacity-50">
            <Send size={16} /> {sending ? "Sending..." : "Send Reply"}
          </button>
        </form>
      )}
    </div>
  );
}
