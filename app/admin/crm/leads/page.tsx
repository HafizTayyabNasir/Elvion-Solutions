"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { UserPlus, Search, Plus, X, Edit2, Trash2, Phone, Mail, Building, DollarSign } from "lucide-react";

interface Lead {
  id: number; name: string; email: string; phone: string; company: string;
  source: string; status: string; notes: string; value: number;
  user: { name: string }; createdAt: string;
}

const statusOptions = ["new", "contacted", "qualified", "lost", "converted"];
const sourceOptions = ["website", "referral", "social", "email", "cold_call", "other"];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", source: "website", status: "new", notes: "", value: "" });

  const fetchLeads = () => {
    fetchAPI("/crm/leads").then(setLeads).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await fetchAPI(`/crm/leads/${editId}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await fetchAPI("/crm/leads", { method: "POST", body: JSON.stringify(form) });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: "", email: "", phone: "", company: "", source: "website", status: "new", notes: "", value: "" });
      fetchLeads();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    try { await fetchAPI(`/crm/leads/${id}`, { method: "DELETE" }); fetchLeads(); } catch (err) { console.error(err); }
  };

  const startEdit = (lead: Lead) => {
    setForm({ name: lead.name, email: lead.email, phone: lead.phone || "", company: lead.company || "", source: lead.source || "website", status: lead.status, notes: lead.notes || "", value: lead.value?.toString() || "" });
    setEditId(lead.id);
    setShowForm(true);
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { new: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400", qualified: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", lost: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", converted: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const filtered = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || l.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM - Leads</h1><p className="text-gray-500 mt-1">Manage your sales pipeline</p></div>
        <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: "", email: "", phone: "", company: "", source: "website", status: "new", notes: "", value: "" }); }}
          className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> Add Lead</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search leads..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...statusOptions].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium ${filterStatus === s ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-500 border border-gray-200 dark:border-white/10"}`}>
              {s === "all" ? "All" : s.replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Lead Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Lead" : "New Lead"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Name *</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Email *</label><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Company</label><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Source</label><select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{sourceOptions.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{statusOptions.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Value ($)</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div><label className="block text-sm text-gray-500 mb-1">Notes</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none" /></div>
              <button type="submit" className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90">{editId ? "Update Lead" : "Create Lead"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-white/5"><tr>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Name</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Contact</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Company</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Source</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Status</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Value</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4"><p className="font-medium text-gray-900 dark:text-white">{lead.name}</p><p className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</p></td>
                  <td className="p-4"><div className="flex flex-col gap-1"><span className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12} /> {lead.email}</span>{lead.phone && <span className="text-xs text-gray-500 flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>}</div></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{lead.company || "—"}</td>
                  <td className="p-4"><span className="text-xs bg-gray-100 dark:bg-white/5 px-2 py-1 rounded text-gray-600 dark:text-gray-400">{lead.source || "—"}</span></td>
                  <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(lead.status)}`}>{lead.status}</span></td>
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{lead.value ? `$${lead.value.toLocaleString()}` : "—"}</td>
                  <td className="p-4"><div className="flex gap-2"><button onClick={() => startEdit(lead)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={14} /></button><button onClick={() => handleDelete(lead.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No leads found</div>}
      </div>
    </div>
  );
}
