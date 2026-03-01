"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Plus, X, Edit2, Trash2, DollarSign, TrendingUp, Clock, CheckCircle, XCircle, ArrowRight } from "lucide-react";

interface Deal {
  id: number; title: string; value: number; stage: string; probability: number;
  expectedCloseDate: string; notes: string;
  contact?: { name: string; company: string };
  lead?: { name: string; company: string };
  user: { name: string }; createdAt: string;
}

const stageOptions = ["discovery", "proposal", "negotiation", "closed_won", "closed_lost"];
const stageLabels: Record<string, string> = { discovery: "Discovery", proposal: "Proposal", negotiation: "Negotiation", closed_won: "Closed Won", closed_lost: "Closed Lost" };

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<{ id: number; name: string }[]>([]);
  const [leads, setLeads] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"pipeline" | "table">("pipeline");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", value: "", stage: "discovery", probability: "20", expectedCloseDate: "", notes: "", contactId: "", leadId: "" });

  const fetchDeals = () => {
    Promise.all([
      fetchAPI("/crm/deals"),
      fetchAPI("/crm/contacts").catch(() => []),
      fetchAPI("/crm/leads").catch(() => []),
    ]).then(([d, c, l]) => { setDeals(d); setContacts(c); setLeads(l); }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchDeals(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, value: parseFloat(form.value) || 0, probability: parseInt(form.probability) || 0, contactId: form.contactId ? parseInt(form.contactId) : null, leadId: form.leadId ? parseInt(form.leadId) : null };
    try {
      if (editId) { await fetchAPI(`/crm/deals/${editId}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await fetchAPI("/crm/deals", { method: "POST", body: JSON.stringify(body) }); }
      setShowForm(false); setEditId(null);
      setForm({ title: "", value: "", stage: "discovery", probability: "20", expectedCloseDate: "", notes: "", contactId: "", leadId: "" });
      fetchDeals();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this deal?")) return;
    try { await fetchAPI(`/crm/deals/${id}`, { method: "DELETE" }); fetchDeals(); } catch (err) { console.error(err); }
  };

  const startEdit = (d: Deal) => {
    setForm({ title: d.title, value: d.value?.toString() || "", stage: d.stage, probability: d.probability?.toString() || "0", expectedCloseDate: d.expectedCloseDate ? d.expectedCloseDate.split("T")[0] : "", notes: d.notes || "", contactId: "", leadId: "" });
    setEditId(d.id); setShowForm(true);
  };

  const getStageColor = (s: string) => {
    const c: Record<string, string> = { discovery: "border-blue-400 bg-blue-50 dark:bg-blue-500/10", proposal: "border-yellow-400 bg-yellow-50 dark:bg-yellow-500/10", negotiation: "border-orange-400 bg-orange-50 dark:bg-orange-500/10", closed_won: "border-green-400 bg-green-50 dark:bg-green-500/10", closed_lost: "border-red-400 bg-red-50 dark:bg-red-500/10" };
    return c[s] || "border-gray-300 bg-gray-50";
  };

  const getStageIcon = (s: string) => {
    if (s === "closed_won") return <CheckCircle size={16} className="text-green-500" />;
    if (s === "closed_lost") return <XCircle size={16} className="text-red-500" />;
    if (s === "negotiation") return <TrendingUp size={16} className="text-orange-500" />;
    if (s === "proposal") return <Clock size={16} className="text-yellow-500" />;
    return <Search size={16} className="text-blue-500" />;
  };

  const totalValue = deals.reduce((s, d) => s + (d.value || 0), 0);
  const wonValue = deals.filter(d => d.stage === "closed_won").reduce((s, d) => s + (d.value || 0), 0);
  const pipelineValue = deals.filter(d => !d.stage.startsWith("closed")).reduce((s, d) => s + (d.value || 0), 0);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">CRM - Deals</h1><p className="text-gray-500 mt-1">Track your sales deals</p></div>
        <div className="flex gap-2">
          <div className="flex bg-white dark:bg-elvion-card rounded-lg border border-gray-200 dark:border-white/10">
            <button onClick={() => setViewMode("pipeline")} className={`px-3 py-2 text-xs rounded-l-lg ${viewMode === "pipeline" ? "bg-elvion-primary text-black" : "text-gray-500"}`}>Pipeline</button>
            <button onClick={() => setViewMode("table")} className={`px-3 py-2 text-xs rounded-r-lg ${viewMode === "table" ? "bg-elvion-primary text-black" : "text-gray-500"}`}>Table</button>
          </div>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", value: "", stage: "discovery", probability: "20", expectedCloseDate: "", notes: "", contactId: "", leadId: "" }); }}
            className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> Add Deal</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20"><DollarSign size={18} className="text-blue-500" /></div>
            <div><p className="text-sm text-gray-500">Total Value</p><p className="text-xl font-bold text-gray-900 dark:text-white">${totalValue.toLocaleString()}</p></div></div>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20"><CheckCircle size={18} className="text-green-500" /></div>
            <div><p className="text-sm text-gray-500">Won</p><p className="text-xl font-bold text-gray-900 dark:text-white">${wonValue.toLocaleString()}</p></div></div>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20"><TrendingUp size={18} className="text-orange-500" /></div>
            <div><p className="text-sm text-gray-500">Pipeline</p><p className="text-xl font-bold text-gray-900 dark:text-white">${pipelineValue.toLocaleString()}</p></div></div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Deal" : "New Deal"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label className="block text-sm text-gray-500 mb-1">Title *</label><input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Value ($)</label><input type="number" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
                <div><label className="block text-sm text-gray-500 mb-1">Stage</label><select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white">{stageOptions.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Probability %</label><input type="number" min="0" max="100" value={form.probability} onChange={e => setForm({ ...form, probability: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Contact</label><select value={form.contactId} onChange={e => setForm({ ...form, contactId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"><option value="">None</option>{contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Lead</label><select value={form.leadId} onChange={e => setForm({ ...form, leadId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"><option value="">None</option>{leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
              </div>
              <div><label className="block text-sm text-gray-500 mb-1">Expected Close Date</label><input type="date" value={form.expectedCloseDate} onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              <div><label className="block text-sm text-gray-500 mb-1">Notes</label><textarea rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none" /></div>
              <button type="submit" className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90">{editId ? "Update Deal" : "Create Deal"}</button>
            </form>
          </div>
        </div>
      )}

      {/* Pipeline View */}
      {viewMode === "pipeline" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stageOptions.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage);
            const stageTotal = stageDeals.reduce((s, d) => s + (d.value || 0), 0);
            return (
              <div key={stage} className="min-w-[280px] flex-shrink-0">
                <div className={`rounded-xl border-t-4 ${getStageColor(stage)} border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card`}>
                  <div className="p-3 border-b border-gray-200 dark:border-white/5">
                    <div className="flex items-center gap-2 mb-1">
                      {getStageIcon(stage)}
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{stageLabels[stage]}</h3>
                      <span className="ml-auto text-xs bg-gray-100 dark:bg-white/5 rounded-full px-2 py-0.5 text-gray-500">{stageDeals.length}</span>
                    </div>
                    <p className="text-xs text-gray-500">${stageTotal.toLocaleString()}</p>
                  </div>
                  <div className="p-2 space-y-2 max-h-[400px] overflow-y-auto">
                    {stageDeals.map(deal => (
                      <div key={deal.id} className="bg-gray-50 dark:bg-elvion-dark/50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-elvion-dark group">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">{deal.title}</h4>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => startEdit(deal)} className="p-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={12} /></button>
                            <button onClick={() => handleDelete(deal.id)} className="p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={12} /></button>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-elvion-primary mt-1">${(deal.value || 0).toLocaleString()}</p>
                        {deal.contact && <p className="text-xs text-gray-500 mt-1">{deal.contact.name}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-gray-400">{deal.probability}% prob.</span>
                          {deal.expectedCloseDate && <span className="text-[10px] text-gray-400">{new Date(deal.expectedCloseDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No deals</p>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-white/5"><tr>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Deal</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Value</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Stage</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Probability</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Close Date</th>
                <th className="p-4 text-gray-900 dark:text-white font-medium">Actions</th>
              </tr></thead>
              <tbody>
                {deals.map(deal => (
                  <tr key={deal.id} className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="p-4"><p className="font-medium text-gray-900 dark:text-white">{deal.title}</p>{deal.contact && <p className="text-xs text-gray-500">{deal.contact.name}</p>}</td>
                    <td className="p-4 font-medium text-elvion-primary">${(deal.value || 0).toLocaleString()}</td>
                    <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full ${getStageColor(deal.stage).replace("border-", "text-").split(" ")[0]} bg-opacity-10`}>{stageLabels[deal.stage]}</span></td>
                    <td className="p-4"><div className="flex items-center gap-2"><div className="w-16 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-elvion-primary rounded-full" style={{ width: `${deal.probability}%` }}></div></div><span className="text-xs text-gray-500">{deal.probability}%</span></div></td>
                    <td className="p-4 text-gray-500 text-xs">{deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toLocaleDateString() : "—"}</td>
                    <td className="p-4"><div className="flex gap-2"><button onClick={() => startEdit(deal)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded text-blue-500"><Edit2 size={14} /></button><button onClick={() => handleDelete(deal.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500"><Trash2 size={14} /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {deals.length === 0 && <div className="p-8 text-center text-gray-500">No deals found</div>}
        </div>
      )}
    </div>
  );
}
