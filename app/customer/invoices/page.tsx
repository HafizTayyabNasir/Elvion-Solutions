"use client";
import { useState, useEffect } from "react";
import { fetchAPI } from "@/lib/api";
import { FileText, DollarSign, Clock, CheckCircle, AlertTriangle, Eye, X, Download } from "lucide-react";

interface InvoiceItem { id: number; description: string; quantity: number; rate: number; amount: number; }
interface Invoice {
  id: number; invoiceNumber: string; status: string; issueDate: string; dueDate: string;
  subtotal: number; tax: number; total: number; notes: string;
  project: { id: number; name: string } | null;
  items: InvoiceItem[]; createdAt: string;
}

export default function CustomerInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchAPI("/invoices").then(setInvoices).catch(console.error).finally(() => setLoading(false));
  }, []);

  const getStatusIcon = (s: string) => {
    if (s === "paid") return <CheckCircle size={16} className="text-green-500" />;
    if (s === "overdue") return <AlertTriangle size={16} className="text-red-500" />;
    if (s === "sent") return <Clock size={16} className="text-blue-500" />;
    return <FileText size={16} className="text-gray-400" />;
  };

  const getStatusColor = (s: string) => {
    const c: Record<string, string> = { draft: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400", sent: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400", paid: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400", overdue: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400", cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-500/10 dark:text-gray-500" };
    return c[s] || "bg-gray-100 text-gray-700";
  };

  const totalPaid = invoices.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0);
  const totalPending = invoices.filter(i => ["sent", "overdue"].includes(i.status)).reduce((s, i) => s + (i.total || 0), 0);

  const filtered = invoices.filter(i => filterStatus === "all" || i.status === filterStatus);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-white">My Invoices</h1><p className="text-gray-400 mt-1">View your billing history</p></div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-elvion-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-green-500/20"><DollarSign size={18} className="text-green-500" /></div>
            <div><p className="text-sm text-gray-400">Total Paid</p><p className="text-xl font-bold text-white">${totalPaid.toLocaleString()}</p></div></div>
        </div>
        <div className="bg-elvion-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-orange-500/20"><Clock size={18} className="text-orange-500" /></div>
            <div><p className="text-sm text-gray-400">Pending</p><p className="text-xl font-bold text-white">${totalPending.toLocaleString()}</p></div></div>
        </div>
        <div className="bg-elvion-card rounded-xl border border-white/10 p-4">
          <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-500/20"><FileText size={18} className="text-blue-500" /></div>
            <div><p className="text-sm text-gray-400">Total Invoices</p><p className="text-xl font-bold text-white">{invoices.length}</p></div></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "sent", "paid", "overdue", "draft"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-2 rounded-lg text-xs font-medium ${filterStatus === s ? "bg-elvion-primary text-black" : "bg-elvion-card text-gray-400 border border-white/10"}`}>
            {s === "all" ? "All" : s.replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {/* View Modal */}
      {viewInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewInvoice(null)}>
          <div className="bg-elvion-card rounded-xl border border-white/10 p-6 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Invoice {viewInvoice.invoiceNumber}</h2>
              <button onClick={() => setViewInvoice(null)} className="p-1 hover:bg-white/5 rounded"><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Status</span><span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(viewInvoice.status)}`}>{viewInvoice.status}</span></div>
              {viewInvoice.project && <div className="flex justify-between text-sm"><span className="text-gray-400">Project</span><span className="text-white">{viewInvoice.project.name}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-gray-400">Issue Date</span><span className="text-white">{new Date(viewInvoice.issueDate || viewInvoice.createdAt).toLocaleDateString()}</span></div>
              {viewInvoice.dueDate && <div className="flex justify-between text-sm"><span className="text-gray-400">Due Date</span><span className="text-white">{new Date(viewInvoice.dueDate).toLocaleDateString()}</span></div>}
              <div className="border-t border-white/5 pt-3 space-y-2">
                {viewInvoice.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm"><span className="text-gray-300">{item.description} x{item.quantity}</span><span className="text-white">${item.amount.toFixed(2)}</span></div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-3">
                <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">${(viewInvoice.subtotal || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-400">Tax</span><span className="text-white">${(viewInvoice.tax || 0).toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-bold mt-1"><span className="text-white">Total</span><span className="text-elvion-primary">${(viewInvoice.total || 0).toFixed(2)}</span></div>
              </div>
              {viewInvoice.notes && <div className="border-t border-white/5 pt-3"><p className="text-xs text-gray-400">{viewInvoice.notes}</p></div>}
            </div>
          </div>
        </div>
      )}

      {/* Invoice List */}
      <div className="space-y-3">
        {filtered.map(invoice => (
          <div key={invoice.id} onClick={() => setViewInvoice(invoice)}
            className="bg-elvion-card rounded-xl border border-white/10 p-4 hover:border-elvion-primary/30 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(invoice.status)}
                <div>
                  <p className="font-medium text-white">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-400">{invoice.project?.name || "No project"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-elvion-primary">${(invoice.total || 0).toLocaleString()}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${getStatusColor(invoice.status)}`}>{invoice.status}</span>
                  {invoice.dueDate && <span className="text-[10px] text-gray-400">Due {new Date(invoice.dueDate).toLocaleDateString()}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="p-8 text-center text-gray-500">No invoices found</div>}
    </div>
  );
}
