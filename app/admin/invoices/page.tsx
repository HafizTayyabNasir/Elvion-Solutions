"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { Search, Plus, X, Edit2, Trash2, FileText, DollarSign, Send, Download, Eye } from "lucide-react";
import InvoiceGenerator from "@/components/InvoiceGenerator";

interface InvoiceItem { id: number; description: string; quantity: number; rate: number; amount: number; unitPrice: number; total: number; }
interface Invoice {
  id: number; invoiceNumber: string; status: string; issueDate: string; dueDate: string;
  subtotal: number; tax: number; total: number; notes: string;
  project: { id: number; name: string } | null;
  user: { id: number; name: string; email: string };
  items: InvoiceItem[]; createdAt: string;
}

const statusOptions = ["draft", "sent", "paid", "overdue", "cancelled"];

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [projects, setProjects] = useState<{ id: number; name: string }[]>([]);
  const [clients, setClients] = useState<{ id: number; name: string; email: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatorInvoice, setGeneratorInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState({ status: "draft", dueDate: "", notes: "", projectId: "", userId: "", tax: "0", items: [{ description: "", quantity: "1", rate: "" }] as { description: string; quantity: string; rate: string }[] });

  const fetchData = () => {
    Promise.all([
      fetchAPI("/invoices"),
      fetchAPI("/projects").catch(() => []),
      fetchAPI("/crm/contacts").catch(() => []),
    ]).then(([i, p, c]) => { setInvoices(i); setProjects(p); setClients(c); }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const addItem = () => setForm({ ...form, items: [...form.items, { description: "", quantity: "1", rate: "" }] });
  const removeItem = (i: number) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  const updateItem = (i: number, field: string, val: string) => {
    const newItems = [...form.items];
    newItems[i] = { ...newItems[i], [field]: val };
    setForm({ ...form, items: newItems });
  };

  const calcSubtotal = () => form.items.reduce((s, item) => s + (parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const subtotal = calcSubtotal();
    const tax = parseFloat(form.tax) || 0;
    const body = {
      status: form.status, dueDate: form.dueDate || null, notes: form.notes,
      projectId: form.projectId ? parseInt(form.projectId) : null,
      userId: form.userId ? parseInt(form.userId) : null,
      subtotal, tax, total: subtotal + tax,
      items: form.items.filter(i => i.description).map(i => ({
        description: i.description, quantity: parseInt(i.quantity) || 1,
        rate: parseFloat(i.rate) || 0, amount: (parseInt(i.quantity) || 1) * (parseFloat(i.rate) || 0),
      })),
    };
    try {
      if (editId) { await fetchAPI(`/invoices/${editId}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await fetchAPI("/invoices", { method: "POST", body: JSON.stringify(body) }); }
      setShowForm(false); setEditId(null);
      setForm({ status: "draft", dueDate: "", notes: "", projectId: "", userId: "", tax: "0", items: [{ description: "", quantity: "1", rate: "" }] });
      fetchData();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this invoice?")) return;
    try { await fetchAPI(`/invoices/${id}`, { method: "DELETE" }); fetchData(); } catch (err) { console.error(err); }
  };

  const updateStatus = async (id: number, status: string) => {
    try { await fetchAPI(`/invoices/${id}`, { method: "PUT", body: JSON.stringify({ status }) }); fetchData(); } catch (err) { console.error(err); }
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { draft: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400", sent: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", paid: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", overdue: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-500/10 dark:text-gray-500" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0);
  const totalOutstanding = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + (i.total || 0), 0);

  const filtered = invoices.filter(i => {
    const matchSearch = i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || i.user.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h1><p className="text-gray-500 mt-1">Manage billing and invoices</p></div>
        <div className="flex gap-2">
          <button onClick={() => { setShowGenerator(true); setGeneratorInvoice(null); }}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-elvion-card border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg font-semibold hover:border-elvion-primary/50 transition-colors"><FileText size={18} /> Generate Invoice</button>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ status: "draft", dueDate: "", notes: "", projectId: "", userId: "", tax: "0", items: [{ description: "", quantity: "1", rate: "" }] }); }}
            className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90"><Plus size={18} /> New Invoice</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-100 dark:bg-green-500/20"><DollarSign size={18} className="text-green-500" /></div>
            <div><p className="text-sm text-gray-500">Revenue</p><p className="text-xl font-bold text-gray-900 dark:text-white">${totalRevenue.toLocaleString()}</p></div></div>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-500/20"><FileText size={18} className="text-orange-500" /></div>
            <div><p className="text-sm text-gray-500">Outstanding</p><p className="text-xl font-bold text-gray-900 dark:text-white">${totalOutstanding.toLocaleString()}</p></div></div>
        </div>
        <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20"><FileText size={18} className="text-blue-500" /></div>
            <div><p className="text-sm text-gray-500">Total Invoices</p><p className="text-xl font-bold text-gray-900 dark:text-white">{invoices.length}</p></div></div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-elvion-card text-gray-900 dark:text-white" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", ...statusOptions].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium ${filterStatus === s ? "bg-elvion-primary text-black" : "bg-white dark:bg-elvion-card text-gray-500 border border-gray-200 dark:border-white/10"}`}>
              {s === "all" ? "All" : s.replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{editId ? "Edit Invoice" : "New Invoice"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm text-gray-500 mb-1">Client *</label><select required value={form.userId} onChange={e => setForm({ ...form, userId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"><option value="">Select</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Project</label><select value={form.projectId} onChange={e => setForm({ ...form, projectId: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white"><option value="">None</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label className="block text-sm text-gray-500 mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white" /></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2"><label className="text-sm text-gray-500">Items</label><button type="button" onClick={addItem} className="text-xs text-elvion-primary hover:underline">+ Add Item</button></div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input placeholder="Description" value={item.description} onChange={e => updateItem(i, "description", e.target.value)} className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white text-sm" />
                      <input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} className="w-20 p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white text-sm text-center" />
                      <input type="number" placeholder="Rate" value={item.rate} onChange={e => updateItem(i, "rate", e.target.value)} className="w-24 p-2 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white text-sm text-right" />
                      <span className="w-24 text-right text-sm font-medium text-gray-900 dark:text-white">${((parseFloat(item.quantity) || 0) * (parseFloat(item.rate) || 0)).toFixed(2)}</span>
                      {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="p-1 text-red-500"><X size={14} /></button>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between gap-8"><span className="text-gray-500">Subtotal:</span><span className="font-medium text-gray-900 dark:text-white">${calcSubtotal().toFixed(2)}</span></div>
                  <div className="flex items-center justify-between gap-4"><span className="text-gray-500">Tax:</span><input type="number" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} className="w-24 p-1.5 rounded border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white text-sm text-right" /></div>
                  <div className="flex justify-between gap-8 pt-1 border-t border-gray-200 dark:border-white/10"><span className="font-medium text-gray-900 dark:text-white">Total:</span><span className="font-bold text-elvion-primary">${(calcSubtotal() + (parseFloat(form.tax) || 0)).toFixed(2)}</span></div>
                </div>
              </div>

              <div><label className="block text-sm text-gray-500 mb-1">Notes</label><textarea rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-elvion-dark text-gray-900 dark:text-white resize-none text-sm" /></div>
              <button type="submit" className="w-full py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90">{editId ? "Update Invoice" : "Create Invoice"}</button>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewInvoice(null)}>
          <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice {viewInvoice.invoiceNumber}</h2>
              <button onClick={() => setViewInvoice(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-white/5 rounded"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Client</span><span className="text-gray-900 dark:text-white">{viewInvoice.user.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Status</span><span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(viewInvoice.status)}`}>{viewInvoice.status}</span></div>
              {viewInvoice.project && <div className="flex justify-between text-sm"><span className="text-gray-500">Project</span><span className="text-gray-900 dark:text-white">{viewInvoice.project.name}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-500">Issue Date</span><span className="text-gray-900 dark:text-white">{new Date(viewInvoice.issueDate || viewInvoice.createdAt).toLocaleDateString()}</span></div>
              {viewInvoice.dueDate && <div className="flex justify-between text-sm"><span className="text-gray-500">Due Date</span><span className="text-gray-900 dark:text-white">{new Date(viewInvoice.dueDate).toLocaleDateString()}</span></div>}
              <div className="border-t border-gray-200 dark:border-white/5 pt-3 space-y-2">
                {viewInvoice.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">{item.description} x{item.quantity}</span><span className="text-gray-900 dark:text-white">${item.amount.toFixed(2)}</span></div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-white/5 pt-3">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span>${(viewInvoice.subtotal || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">Tax</span><span>${(viewInvoice.tax || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-bold mt-1"><span className="text-gray-900 dark:text-white">Total</span><span className="text-elvion-primary">${(viewInvoice.total || 0).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-elvion-card rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-white/5"><tr>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Invoice</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Client</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Status</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Amount</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Due Date</th>
              <th className="p-4 text-gray-900 dark:text-white font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(invoice => (
                <tr key={invoice.id} className="border-t border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5">
                  <td className="p-4"><p className="font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</p><p className="text-[10px] text-gray-400">{invoice.project?.name}</p></td>
                  <td className="p-4 text-gray-600 dark:text-gray-400">{invoice.user.name}</td>
                  <td className="p-4">
                    <select value={invoice.status} onChange={e => updateStatus(invoice.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border-0 cursor-pointer ${getStatusColor(invoice.status)}`}>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-4 font-medium text-elvion-primary">${(invoice.total || 0).toLocaleString()}</td>
                  <td className="p-4 text-gray-500 text-xs">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</td>
                  <td className="p-4"><div className="flex gap-1">
                    <button onClick={() => setViewInvoice(invoice)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500" title="View"><Eye size={14} /></button>
                    <button onClick={() => { setGeneratorInvoice(invoice); setShowGenerator(true); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded text-gray-500" title="Download PDF"><Download size={14} /></button>
                    <button onClick={() => handleDelete(invoice.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-red-500" title="Delete"><Trash2 size={14} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No invoices found</div>}
      </div>

      {/* Invoice Generator Modal */}
      {showGenerator && (
        <InvoiceGenerator
          invoice={generatorInvoice}
          users={clients}
          projects={projects}
          onClose={() => { setShowGenerator(false); setGeneratorInvoice(null); }}
          onSave={() => fetchData()}
        />
      )}
    </div>
  );
}
