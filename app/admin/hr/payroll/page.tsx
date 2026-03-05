"use client";
import { useState, useEffect } from "react";
import {
  DollarSign, Plus, Edit2, Trash2, X, AlertCircle,
  CheckCircle2, Clock, FileText, CreditCard,
  TrendingUp, Banknote, Receipt, Zap
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Employee {
  id: number; employeeId: string; firstName: string; lastName: string;
  position: string | null; department: { name: string } | null;
}
interface Payroll {
  id: number; employeeId: number;
  employee: Employee;
  month: number; year: number;
  baseSalary: number; bonus: number; deductions: number; tax: number; netPay: number;
  currency: string; status: string; paidDate: string | null; notes: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  draft: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: FileText, label: "Draft" },
  processed: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock, label: "Processed" },
  paid: { color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2, label: "Paid" },
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [editing, setEditing] = useState<Payroll | null>(null);
  const [form, setForm] = useState({
    employeeId: "", month: "", year: "", baseSalary: "", bonus: "0", deductions: "0", tax: "0", currency: "USD", notes: ""
  });
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1);
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear());
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchPayrolls = async () => {
    try {
      const params = new URLSearchParams();
      params.set("month", selectedMonth.toString());
      params.set("year", selectedYear.toString());
      if (filterStatus) params.set("status", filterStatus);
      if (filterEmployee) params.set("employeeId", filterEmployee);
      const data = await fetchAPI(`/hr/payroll?${params}`);
      setPayrolls(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try { setEmployees(await fetchAPI("/hr/employees?status=active")); } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchEmployees(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLoading(true); fetchPayrolls(); }, [selectedMonth, selectedYear, filterStatus, filterEmployee]);

  const calcNet = () => {
    const base = parseFloat(form.baseSalary) || 0;
    const bonus = parseFloat(form.bonus) || 0;
    const deductions = parseFloat(form.deductions) || 0;
    const tax = parseFloat(form.tax) || 0;
    return base + bonus - deductions - tax;
  };

  const openEdit = (p: Payroll) => {
    setEditing(p);
    setForm({
      employeeId: p.employeeId.toString(),
      month: p.month.toString(),
      year: p.year.toString(),
      baseSalary: p.baseSalary.toString(),
      bonus: p.bonus.toString(),
      deductions: p.deductions.toString(),
      tax: p.tax.toString(),
      currency: p.currency,
      notes: p.notes || "",
    });
    setError("");
    setShowModal(true);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      employeeId: "", month: selectedMonth.toString(), year: selectedYear.toString(),
      baseSalary: "", bonus: "0", deductions: "0", tax: "0", currency: "USD", notes: ""
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editing) {
      setSaving(true); setError("");
      try {
        await fetchAPI(`/hr/payroll/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify({
            baseSalary: form.baseSalary,
            bonus: form.bonus,
            deductions: form.deductions,
            tax: form.tax,
            notes: form.notes,
          }),
        });
        setShowModal(false);
        fetchPayrolls();
      } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to update payroll"); }
      finally { setSaving(false); }
    } else {
      if (!form.employeeId || !form.baseSalary) {
        setError("Employee and base salary are required");
        return;
      }
      setSaving(true); setError("");
      try {
        await fetchAPI("/hr/payroll", {
          method: "POST",
          body: JSON.stringify({
            employeeId: parseInt(form.employeeId),
            month: parseInt(form.month),
            year: parseInt(form.year),
            baseSalary: parseFloat(form.baseSalary),
            bonus: parseFloat(form.bonus) || 0,
            deductions: parseFloat(form.deductions) || 0,
            tax: parseFloat(form.tax) || 0,
            currency: form.currency,
            notes: form.notes,
          }),
        });
        setShowModal(false);
        fetchPayrolls();
      } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to create payroll record"); }
      finally { setSaving(false); }
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await fetchAPI(`/hr/payroll/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      fetchPayrolls();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this payroll record?")) return;
    try {
      await fetchAPI(`/hr/payroll/${id}`, { method: "DELETE" });
      fetchPayrolls();
    } catch (e) { console.error(e); }
  };

  const handleGenerate = async () => {
    setGenerating(true); setError("");
    try {
      await fetchAPI("/hr/payroll", {
        method: "POST",
        body: JSON.stringify({ generateAll: true, month: generateMonth, year: generateYear }),
      });
      setShowGenerateModal(false);
      setSelectedMonth(generateMonth);
      setSelectedYear(generateYear);
      fetchPayrolls();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to generate payroll"); }
    finally { setGenerating(false); }
  };

  const totalBase = payrolls.reduce((s, p) => s + p.baseSalary, 0);
  const totalBonus = payrolls.reduce((s, p) => s + p.bonus, 0);
  const totalDeductions = payrolls.reduce((s, p) => s + p.deductions + p.tax, 0);
  const totalNet = payrolls.reduce((s, p) => s + p.netPay, 0);
  const paidCount = payrolls.filter(p => p.status === "paid").length;
  const draftCount = payrolls.filter(p => p.status === "draft").length;

  const currentYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Payroll Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage employee salaries, bonuses, and payments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowGenerateModal(true); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition text-sm"
          >
            <Zap size={16} /> Generate Payroll
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition text-sm"
          >
            <Plus size={16} /> Add Record
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Base Salary", value: `$${totalBase.toLocaleString()}`, icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Total Bonuses", value: `$${totalBonus.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Total Deductions & Tax", value: `$${totalDeductions.toLocaleString()}`, icon: Receipt, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Net Payroll", value: `$${totalNet.toLocaleString()}`, icon: Banknote, color: "text-elvion-primary", bg: "bg-elvion-primary/10" },
        ].map((card) => (
          <div key={card.label} className="bg-elvion-card border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-400">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Month/Year Selector & Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(parseInt(e.target.value))}
          className="bg-elvion-card border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-elvion-primary"
        >
          {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(parseInt(e.target.value))}
          className="bg-elvion-card border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-elvion-primary"
        >
          {currentYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-elvion-card border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-elvion-primary"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="processed">Processed</option>
          <option value="paid">Paid</option>
        </select>
        <select
          value={filterEmployee}
          onChange={e => setFilterEmployee(e.target.value)}
          className="bg-elvion-card border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-elvion-primary"
        >
          <option value="">All Employees</option>
          {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
        </select>
        <div className="ml-auto flex gap-2 text-xs">
          <span className="text-gray-500">{payrolls.length} records</span>
          <span className="text-gray-600">•</span>
          <span className="text-green-400">{paidCount} paid</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-400">{draftCount} draft</span>
        </div>
      </div>

      {/* Payroll Table */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-elvion-primary"></div>
        </div>
      ) : payrolls.length === 0 ? (
        <div className="text-center py-16 bg-elvion-card border border-white/10 rounded-xl">
          <DollarSign size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No payroll records for {months[selectedMonth - 1]} {selectedYear}</p>
          <p className="text-gray-600 text-sm mt-1">Generate payroll or add individual records</p>
          <button
            onClick={() => { setShowGenerateModal(true); setError(""); }}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition text-sm"
          >
            <Zap size={16} /> Generate Payroll
          </button>
        </div>
      ) : (
        <div className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-gray-400 font-medium p-4">Employee</th>
                  <th className="text-right text-gray-400 font-medium p-4">Base Salary</th>
                  <th className="text-right text-gray-400 font-medium p-4">Bonus</th>
                  <th className="text-right text-gray-400 font-medium p-4">Deductions</th>
                  <th className="text-right text-gray-400 font-medium p-4">Tax</th>
                  <th className="text-right text-gray-400 font-medium p-4">Net Pay</th>
                  <th className="text-left text-gray-400 font-medium p-4">Status</th>
                  <th className="text-right text-gray-400 font-medium p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map(p => {
                  const cfg = statusConfig[p.status] || statusConfig.draft;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/2 transition">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">{p.employee.firstName} {p.employee.lastName}</p>
                          <p className="text-gray-500 text-xs">{p.employee.position} {p.employee.department ? `• ${p.employee.department.name}` : ""}</p>
                        </div>
                      </td>
                      <td className="p-4 text-right text-white">${p.baseSalary.toLocaleString()}</td>
                      <td className="p-4 text-right text-green-400">{p.bonus > 0 ? `+$${p.bonus.toLocaleString()}` : "-"}</td>
                      <td className="p-4 text-right text-red-400">{p.deductions > 0 ? `-$${p.deductions.toLocaleString()}` : "-"}</td>
                      <td className="p-4 text-right text-red-400">{p.tax > 0 ? `-$${p.tax.toLocaleString()}` : "-"}</td>
                      <td className="p-4 text-right text-white font-bold">${p.netPay.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                          <StatusIcon size={12} /> {cfg.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          {p.status === "draft" && (
                            <button onClick={() => handleStatusChange(p.id, "processed")} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition" title="Mark Processed">
                              <Clock size={16} />
                            </button>
                          )}
                          {(p.status === "draft" || p.status === "processed") && (
                            <button onClick={() => handleStatusChange(p.id, "paid")} className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition" title="Mark Paid">
                              <CreditCard size={16} />
                            </button>
                          )}
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Totals Row */}
              <tfoot>
                <tr className="border-t border-white/10 bg-white/2">
                  <td className="p-4 text-white font-bold">Totals ({payrolls.length} employees)</td>
                  <td className="p-4 text-right text-white font-bold">${totalBase.toLocaleString()}</td>
                  <td className="p-4 text-right text-green-400 font-bold">{totalBonus > 0 ? `+$${totalBonus.toLocaleString()}` : "-"}</td>
                  <td className="p-4 text-right text-red-400 font-bold">{payrolls.reduce((s, p) => s + p.deductions, 0) > 0 ? `-$${payrolls.reduce((s, p) => s + p.deductions, 0).toLocaleString()}` : "-"}</td>
                  <td className="p-4 text-right text-red-400 font-bold">{payrolls.reduce((s, p) => s + p.tax, 0) > 0 ? `-$${payrolls.reduce((s, p) => s + p.tax, 0).toLocaleString()}` : "-"}</td>
                  <td className="p-4 text-right text-elvion-primary font-bold text-lg">${totalNet.toLocaleString()}</td>
                  <td className="p-4"></td>
                  <td className="p-4"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elvion-card border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editing ? "Edit Payroll Record" : "Add Payroll Record"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
            <div className="space-y-4">
              {!editing && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Employee *</label>
                    <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary">
                      <option value="">Select employee</option>
                      {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Month</label>
                      <select value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary">
                        {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Year</label>
                      <select value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary">
                        {currentYears.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Base Salary *</label>
                  <input type="number" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Bonus</label>
                  <input type="number" value={form.bonus} onChange={e => setForm({ ...form, bonus: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" placeholder="0.00" min="0" step="0.01" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Deductions</label>
                  <input type="number" value={form.deductions} onChange={e => setForm({ ...form, deductions: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Tax</label>
                  <input type="number" value={form.tax} onChange={e => setForm({ ...form, tax: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" placeholder="0.00" min="0" step="0.01" />
                </div>
              </div>

              {/* Net Pay Preview */}
              <div className="p-4 bg-elvion-dark border border-elvion-primary/20 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Net Pay</span>
                  <span className="text-2xl font-bold text-elvion-primary">${calcNet().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  Base (${parseFloat(form.baseSalary) || 0}) + Bonus (${parseFloat(form.bonus) || 0}) - Deductions (${parseFloat(form.deductions) || 0}) - Tax (${parseFloat(form.tax) || 0})
                </div>
              </div>

              {!editing && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Currency</label>
                  <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="PKR">PKR - Pakistani Rupee</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="SAR">SAR - Saudi Riyal</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary resize-none" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition text-sm font-medium">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition text-sm disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elvion-card border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Generate Payroll</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              This will create payroll records for all active employees based on their current salary. Existing records will not be overwritten.
            </p>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Month</label>
                <select value={generateMonth} onChange={e => setGenerateMonth(parseInt(e.target.value))} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary">
                  {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Year</label>
                <select value={generateYear} onChange={e => setGenerateYear(parseInt(e.target.value))} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary">
                  {currentYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg mb-6">
              <p className="text-amber-400 text-xs flex items-center gap-2"><AlertCircle size={14} /> {employees.length} active employees will have payroll records generated</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowGenerateModal(false)} className="flex-1 py-2.5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition text-sm font-medium">Cancel</button>
              <button onClick={handleGenerate} disabled={generating} className="flex-1 py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? "Generating..." : <><Zap size={16} /> Generate</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
