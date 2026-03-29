"use client";
import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2, Download, Save } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface InvoiceGeneratorProps {
  invoice?: {
    id: number; invoiceNumber: string; status: string; issueDate: string; dueDate: string;
    subtotal: number; tax: number; total: number; notes: string;
    project: { id: number; name: string } | null;
    user: { id: number; name: string; email: string };
    items: { id: number; description: string; quantity: number; unitPrice: number; total: number }[];
  } | null;
  users: { id: number; name: string; email: string }[];
  projects: { id: number; name: string }[];
  onClose: () => void;
  onSave?: () => void;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

const currencies = ["USD", "EUR", "GBP", "PKR", "INR", "SAR", "AED"];

const paymentMethodOptions = [
  "Bank Transfer",
  "Cash",
  "Credit Card",
  "Debit Card",
  "PayPal",
  "Stripe",
  "Wise",
  "JazzCash",
  "EasyPaisa",
  "Payoneer",
  "Crypto",
  "Cheque",
];

const formatCurrency = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

export default function InvoiceGenerator({ invoice, users, projects, onClose, onSave }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [items, setItems] = useState<LineItem[]>([{ description: "", quantity: 1, unitPrice: 0 }]);
  const [taxRate, setTaxRate] = useState(0);
  const [discountRate, setDiscountRate] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentEntries, setPaymentEntries] = useState<{ method: string; accountNo: string }[]>([{ method: "Bank Transfer", accountNo: "" }]);
  const addPaymentEntry = () => setPaymentEntries([...paymentEntries, { method: "", accountNo: "" }]);
  const removePaymentEntry = (i: number) => paymentEntries.length > 1 && setPaymentEntries(paymentEntries.filter((_, idx) => idx !== i));
  const updatePaymentEntry = (i: number, field: "method" | "accountNo", val: string) => {
    const u = [...paymentEntries]; u[i] = { ...u[i], [field]: val }; setPaymentEntries(u);
  };

  useEffect(() => {
    if (!invoice) {
      fetchAPI("/invoices").then((invoices: { invoiceNumber?: string; number?: string }[]) => {
        let maxNum = 0;
        invoices.forEach((inv) => {
          const num = inv.invoiceNumber || inv.number || "";
          const match = num.match(/INV-(\d+)/);
          if (match) maxNum = Math.max(maxNum, parseInt(match[1]));
        });
        setInvoiceNumber(`INV-${String(maxNum + 1).padStart(5, "0")}`);
      }).catch(() => setInvoiceNumber("INV-00001"));
    }
  }, [invoice]);

  useEffect(() => {
    if (invoice) {
      setClientId(String(invoice.user.id));
      setProjectId(invoice.project ? String(invoice.project.id) : "");
      setInvoiceNumber(invoice.invoiceNumber);
      setIssueDate(invoice.issueDate ? invoice.issueDate.split("T")[0] : new Date().toISOString().split("T")[0]);
      setDueDate(invoice.dueDate ? invoice.dueDate.split("T")[0] : "");
      setItems(invoice.items.length > 0 ? invoice.items.map(i => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })) : [{ description: "", quantity: 1, unitPrice: 0 }]);
      setTaxRate(invoice.subtotal > 0 ? Math.round((invoice.tax / invoice.subtotal) * 100 * 100) / 100 : 0);
      setNotes(invoice.notes || "");
    }
  }, [invoice]);

  const selectedClient = users.find(u => String(u.id) === clientId);
  const selectedProject = projects.find(p => String(p.id) === projectId);

  const subtotal = items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
  const discountValue = subtotal * (discountRate / 100);
  const taxableAmount = subtotal - discountValue;
  const taxValue = taxableAmount * (taxRate / 100);
  const grandTotal = taxableAmount + taxValue;

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof LineItem, val: string | number) => {
    const updated = [...items];
    if (field === "description") updated[i] = { ...updated[i], description: val as string };
    else updated[i] = { ...updated[i], [field]: parseFloat(val as string) || 0 };
    setItems(updated);
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#FFFFFF",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      if (scaledHeight <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, scaledHeight);
      } else {
        let position = 0;
        while (position < scaledHeight) {
          if (position > 0) pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, scaledHeight);
          position += pdfHeight;
        }
      }

      pdf.save(`${invoiceNumber || "invoice"}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleSave = async () => {
    if (!clientId) { alert("Please select a client"); return; }
    setSaving(true);
    try {
      await fetchAPI("/invoices", {
        method: "POST",
        body: JSON.stringify({
          clientId: parseInt(clientId),
          projectId: projectId ? parseInt(projectId) : null,
          dueDate: dueDate || null,
          items: items.filter(i => i.description).map(i => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
          notes,
          currency,
          tax: taxRate,
        }),
      });
      onSave?.();
      alert("Invoice saved successfully!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="flex max-h-[95vh] w-full max-w-7xl flex-col rounded-xl border border-white/10 bg-elvion-card shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Invoice Generator</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Form */}
          <div className="w-2/5 space-y-4 overflow-y-auto border-r border-white/10 p-5">
            {/* Client & Project */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase">Client *</label>
                <select value={clientId} onChange={e => setClientId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-elvion-dark px-3 py-2 text-sm text-white">
                  <option value="">Select Client</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase">Project</label>
                <select value={projectId} onChange={e => setProjectId(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-elvion-dark px-3 py-2 text-sm text-white">
                  <option value="">None</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>

            {/* Dates & Currency */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase">Issue Date</label>
                <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-elvion-dark px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-elvion-dark px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase">Currency</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-elvion-dark px-3 py-2 text-sm text-white">
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div>
              <label className="mb-2 block text-[10px] tracking-wider text-gray-400 uppercase">Line Items</label>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="rounded-lg border border-white/5 bg-elvion-dark/50 p-3">
                    <div className="flex items-start gap-2">
                      <input type="text" placeholder="Description" value={item.description}
                        onChange={e => updateItem(i, "description", e.target.value)}
                        className="flex-1 rounded border border-white/10 bg-elvion-dark px-2 py-1.5 text-sm text-white placeholder:text-gray-500" />
                      {items.length > 1 && (
                        <button onClick={() => removeItem(i)} className="shrink-0 rounded p-1.5 text-red-400 hover:bg-red-500/10">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div>
                        <label className="mb-0.5 block text-[9px] text-gray-500">Qty</label>
                        <input type="number" min="1" value={item.quantity}
                          onChange={e => updateItem(i, "quantity", e.target.value)}
                          className="w-full rounded border border-white/10 bg-elvion-dark px-2 py-1.5 text-sm text-white" />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[9px] text-gray-500">Unit Price</label>
                        <input type="number" min="0" step="0.01" value={item.unitPrice || ""}
                          onChange={e => updateItem(i, "unitPrice", e.target.value)}
                          className="w-full rounded border border-white/10 bg-elvion-dark px-2 py-1.5 text-sm text-white" />
                      </div>
                      <div>
                        <label className="mb-0.5 block text-[9px] text-gray-500">Total</label>
                        <div className="px-2 py-1.5 text-sm font-semibold text-elvion-primary">
                          {formatCurrency(item.quantity * item.unitPrice, currency)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={addItem}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-elvion-primary hover:text-elvion-primary/80">
                <Plus size={14} /> Add Item
              </button>
            </div>

            {/* Tax & Discount */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase">Tax (%)</label>
                <input type="number" min="0" step="0.1" value={taxRate || ""}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/10 bg-elvion-dark px-3 py-2 text-sm text-white" />
              </div>
              <div>
                <label className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase">Discount (%)</label>
                <input type="number" min="0" step="0.1" value={discountRate || ""}
                  onChange={e => setDiscountRate(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-white/10 bg-elvion-dark px-3 py-2 text-sm text-white" />
              </div>
            </div>

            {/* Payment Methods & Accounts */}
            <div>
              <label className="mb-2 block text-[10px] tracking-wider text-gray-400 uppercase">Payment Methods</label>
              <div className="space-y-2">
                {paymentEntries.map((entry, i) => (
                  <div key={i} className="rounded-lg border border-white/5 bg-elvion-dark/50 p-3">
                    <div className="flex items-start gap-2">
                      <select value={entry.method} onChange={e => updatePaymentEntry(i, "method", e.target.value)}
                        className="flex-1 rounded border border-white/10 bg-elvion-dark px-2 py-1.5 text-sm text-white">
                        <option value="">Select Method</option>
                        {paymentMethodOptions.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      {paymentEntries.length > 1 && (
                        <button onClick={() => removePaymentEntry(i)} className="shrink-0 rounded p-1.5 text-red-400 hover:bg-red-500/10">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <input type="text" value={entry.accountNo} onChange={e => updatePaymentEntry(i, "accountNo", e.target.value)}
                      placeholder="Account / Bank number"
                      className="mt-2 w-full rounded border border-white/10 bg-elvion-dark px-2 py-1.5 text-sm text-white placeholder:text-gray-500" />
                  </div>
                ))}
              </div>
              <button onClick={addPaymentEntry}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-elvion-primary hover:text-elvion-primary/80">
                <Plus size={14} /> Add Payment Method
              </button>
            </div>

            {/* Notes */}
            <div>
              <label className="mb-1 block text-[10px] tracking-wider text-gray-400 uppercase">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                placeholder="Thank you for your business!"
                className="w-full resize-none rounded-lg border border-white/10 bg-elvion-dark px-3 py-2 text-sm text-white placeholder:text-gray-500" />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {!invoice && (
                <button onClick={handleSave} disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-elvion-primary px-4 py-2.5 text-sm font-semibold text-black hover:bg-elvion-primary/90 disabled:opacity-50">
                  <Save size={16} /> {saving ? "Saving..." : "Save Invoice"}
                </button>
              )}
              <button onClick={handleDownloadPDF} disabled={downloading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100 disabled:opacity-50">
                <Download size={16} /> {downloading ? "Generating..." : "Download PDF"}
              </button>
            </div>
          </div>

          {/* Right Panel - Invoice Preview */}
          <div className="w-3/5 overflow-y-auto bg-gray-100 p-6 dark:bg-gray-800/50">
            <div ref={invoiceRef} className="mx-auto rounded-lg bg-white shadow-sm" style={{ maxWidth: 680, padding: 40, fontFamily: "system-ui, -apple-system, sans-serif" }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg, #121212 0%, #1a1f2e 100%)", borderRadius: 10, padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <img src="/logo.webp" alt="Elvion" style={{ height: 40 }} crossOrigin="anonymous" />
                <div style={{ textAlign: "right" }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, color: "#00D28D", margin: 0, letterSpacing: 3 }}>INVOICE</h1>
                  <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{invoiceNumber || "INV-XXXXX"}</p>
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, marginTop: 12, fontSize: 11, color: "#6b7280" }}>
                <span><strong style={{ color: "#374151" }}>Issue Date:</strong> {issueDate || "—"}</span>
                <span><strong style={{ color: "#374151" }}>Due Date:</strong> {dueDate || "—"}</span>
              </div>

              {/* From / To */}
              <div style={{ display: "flex", gap: 40, marginTop: 28, paddingBottom: 20, borderBottom: "1px solid #e5e7eb" }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#9ca3af", marginBottom: 6, fontWeight: 600 }}>From</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>Elvion Solutions</p>
                  <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>info@elvionsolutions.com</p>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#9ca3af", marginBottom: 6, fontWeight: 600 }}>Bill To</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{selectedClient?.name || "—"}</p>
                  <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{selectedClient?.email || "—"}</p>
                  {selectedProject && <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>Project: {selectedProject.name}</p>}
                </div>
              </div>

              {/* Items Table */}
              <table style={{ width: "100%", marginTop: 24, borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ backgroundColor: "#f9fafb" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>#</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Description</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Qty</th>
                    <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Price</th>
                    <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.filter(i => i.description).map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "10px 12px", color: "#9ca3af" }}>{i + 1}</td>
                      <td style={{ padding: "10px 12px", color: "#111827", fontWeight: 500 }}>{item.description}</td>
                      <td style={{ padding: "10px 12px", color: "#6b7280", textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ padding: "10px 12px", color: "#6b7280", textAlign: "right" }}>{formatCurrency(item.unitPrice, currency)}</td>
                      <td style={{ padding: "10px 12px", color: "#111827", fontWeight: 600, textAlign: "right" }}>{formatCurrency(item.quantity * item.unitPrice, currency)}</td>
                    </tr>
                  ))}
                  {items.filter(i => i.description).length === 0 && (
                    <tr><td colSpan={5} style={{ padding: "20px 12px", color: "#9ca3af", textAlign: "center", fontStyle: "italic" }}>No items added yet</td></tr>
                  )}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <div style={{ width: 260 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: "#6b7280" }}>
                    <span>Subtotal</span>
                    <span style={{ color: "#374151", fontWeight: 500 }}>{formatCurrency(subtotal, currency)}</span>
                  </div>
                  {discountRate > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: "#ef4444" }}>
                      <span>Discount ({discountRate}%)</span>
                      <span>-{formatCurrency(discountValue, currency)}</span>
                    </div>
                  )}
                  {taxRate > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 12, color: "#6b7280" }}>
                      <span>Tax ({taxRate}%)</span>
                      <span style={{ color: "#374151", fontWeight: 500 }}>{formatCurrency(taxValue, currency)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginTop: 8, borderTop: "2px solid #00D28D", fontSize: 16, fontWeight: 700 }}>
                    <span style={{ color: "#111827" }}>Total</span>
                    <span style={{ color: "#00D28D" }}>{formatCurrency(grandTotal, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              {paymentEntries.some(e => e.method || e.accountNo.trim()) && (
                <div style={{ marginTop: 28, padding: 16, backgroundColor: "#f9fafb", borderRadius: 8, fontSize: 11 }}>
                  <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#9ca3af", marginBottom: 8, fontWeight: 600 }}>Payment Information</p>
                  {paymentEntries.filter(e => e.method || e.accountNo.trim()).map((entry, i) => (
                    <div key={i} style={{ marginTop: i > 0 ? 8 : 0, paddingTop: i > 0 ? 8 : 0, borderTop: i > 0 ? "1px solid #e5e7eb" : "none" }}>
                      {entry.method && <p style={{ color: "#374151", fontWeight: 500 }}>{entry.method}</p>}
                      {entry.accountNo.trim() && <p style={{ color: "#6b7280", marginTop: 2 }}>Account: {entry.accountNo}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Notes */}
              {notes && (
                <div style={{ marginTop: 16, fontSize: 11, color: "#6b7280" }}>
                  <p style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#9ca3af", marginBottom: 4, fontWeight: 600 }}>Notes</p>
                  <p>{notes}</p>
                </div>
              )}

              {/* Footer */}
              <div style={{ marginTop: 32, padding: "16px 20px", background: "linear-gradient(135deg, #121212 0%, #1a1f2e 100%)", borderRadius: 8, textAlign: "center", fontSize: 10, color: "#9ca3af" }}>
                <p style={{ color: "#00D28D", fontWeight: 600, margin: 0 }}>Elvion Solutions</p>
                <p style={{ marginTop: 2, margin: 0 }}>Digital Marketing & Automation Solutions &bull; elvionsolutions.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
