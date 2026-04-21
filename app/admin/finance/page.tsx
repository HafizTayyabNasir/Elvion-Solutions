"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, ComposedChart, CartesianGrid,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Calendar, RefreshCw, DollarSign, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, AlertCircle, AlertTriangle,
  CheckCircle, Clock, Download, Plus, Trash2, ChevronUp,
  ChevronDown, Activity, Users, Briefcase, BarChart3,
  FileText, Shield, Target, Zap, X, Eye,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type Currency = "USD" | "PKR";
type Tab = "overview" | "cashflow" | "plrevenue" | "expensesbudget" | "billing" | "payroll" | "tax" | "forecasting" | "reports";

interface DateRange { startDate: string; endDate: string; }

interface Metrics {
  period: { startDate: string; endDate: string };
  currency: string;
  revenue: { total: number; invoiceRevenue: number; paymentRevenue: number; monthlyRecurring: number; forecast3Months: number[]; growthPercent: number; last12Months: number[]; last12Labels: string[] };
  expenses: { total: number; monthlyAverage: number; monthlyBurnRate: number };
  profit: { netProfit: number; profitMargin: number; ebitda: number };
  liquidity: { cashOnHand: number; accountsReceivable: number; accountsPayable: number };
  health: { runway: number; runwayHealthColor: string; collectionEfficiency: number; dso: number; concentrationRisk: number; concentrationRiskLevel: string; healthScore: number; healthScoreColor: string; payrollPct: number };
}

interface CashflowData {
  monthly: Array<{ month: string; monthFull: string; inflow: number; outflow: number; net: number; runningBalance: number }>;
  projection: Array<{ month: string; net: number; projected: boolean }>;
  summary: { totalInflow: number; totalOutflow: number; netCashflow: number; cashflowHealthScore: number };
}

interface PLData {
  period: { start: string; end: string };
  grossRevenue: number; cogs: number; grossProfit: number; grossMargin: number;
  operatingExpenses: Record<string, number>; totalOperatingExpenses: number;
  ebitda: number; netProfit: number; netMargin: number;
}

interface RevenueBreakdown {
  byClient: Array<{ name: string; revenue: number; projectCount: number; pct: number }>;
  byServiceType: Array<{ type: string; revenue: number; pct: number }>;
  topClientConcentration: number; concentrationWarning: boolean; totalRevenue: number;
}

interface Expense {
  id: number; date: string; vendor: string; category: string; amount: number;
  currency: string; paymentMethod: string | null; isRecurring: boolean; notes: string | null;
}

interface Budget { id: number; year: number; month: number | null; category: string; plannedAmount: number; currency: string; }

interface InvoiceAging {
  buckets: { current: number; days30: number; days60: number; days90: number; over90: number };
  bucketCounts: { current: number; days30: number; days60: number; days90: number; over90: number };
  invoices: Array<{ id: number; number: string; total: number; totalCents: number; dueDate: string | null; status: string; daysOverdue: number; user: { name: string | null; company: string | null } }>;
}

interface ProjectProfit {
  id: number; name: string; status: string; client: string;
  revenue: number; costs: number; grossProfit: number; margin: number;
  budget: number | null; isLoss: boolean;
}

interface TaxEntry { id: number; quarter: number; year: number; estimatedLiability: number; amountSetAside: number; notes: string | null; }

interface FinancialAlert { id: number; type: string; message: string; severity: string; createdAt: string; isResolved: boolean; }

interface ForecastData {
  historical: { revenue: number[]; expenses: number[]; labels: string[] };
  forecast: { scenarios: { conservative: number[]; baseline: number[]; optimistic: number[] }; expenses: number[]; labels: string[] };
  growthRate: number;
}

interface PayrollRecord { id: number; month: number; year: number; baseSalary: number; bonus: number; deductions: number; tax: number; netPay: number; currency: string; status: string; employee: { firstName: string; lastName: string; employmentType: string } }

// ─────────────────────────────────────────────
// PALETTE
// ─────────────────────────────────────────────
const COLORS = ["#00D28D", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899", "#84CC16"];
const EXPENSE_COLORS: Record<string, string> = {
  payroll: "#00D28D", software: "#3B82F6", marketing: "#F59E0B",
  office: "#8B5CF6", legal: "#06B6D4", other: "#A1A1A1",
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function fmtCurrency(cents: number, currency: Currency): string {
  const amount = cents / 100;
  const symbol = currency === "PKR" ? "₨" : "$";
  if (Math.abs(amount) >= 1_000_000) return `${symbol}${(amount / 1_000_000).toFixed(2)}M`;
  if (Math.abs(amount) >= 1_000) return `${symbol}${(amount / 1_000).toFixed(1)}k`;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtPct(n: number, showSign = false): string {
  const sign = showSign && n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}
function clrPct(n: number) { return n >= 0 ? "text-green-400" : "text-red-400"; }

// ─────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-white/10 rounded ${className}`} />;
}

// ─────────────────────────────────────────────
// HEALTH GAUGE (SVG radial)
// ─────────────────────────────────────────────
function HealthGauge({ score, color }: { score: number; color: string }) {
  const r = 46, cx = 60, cy = 60;
  const circumference = Math.PI * r; // half circle
  const filled = (score / 100) * circumference;
  const strokeColor = color === "green" ? "#00D28D" : color === "yellow" ? "#FBBF24" : "#EF4444";
  return (
    <svg width="120" height="80" viewBox="0 0 120 80">
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" strokeLinecap="round" />
      <path d={`M ${cx - r},${cy} A ${r},${r} 0 0 1 ${cx + r},${cy}`} fill="none" stroke={strokeColor} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference}`} />
      <text x="60" y="58" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">{score}</text>
      <text x="60" y="74" textAnchor="middle" fill="#A1A1A1" fontSize="9">/ 100</text>
    </svg>
  );
}

// ─────────────────────────────────────────────
// RUNWAY BAR
// ─────────────────────────────────────────────
function RunwayBar({ months }: { months: number }) {
  const max = 24;
  const pct = Math.min(100, (months / max) * 100);
  const color = months > 12 ? "bg-green-400" : months > 6 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-elvion-gray">Runway</span>
        <span className={`font-bold ${months > 12 ? "text-green-400" : months > 6 ? "text-yellow-400" : "text-red-400"}`}>
          {months >= 999 ? "∞" : `${months.toFixed(1)} mo`}
        </span>
      </div>
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs mt-1 text-elvion-gray">
        <span>0</span><span className="text-red-400">6 mo</span><span className="text-yellow-400">12 mo</span><span>24+</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// KPI CARD
// ─────────────────────────────────────────────
function KPICard({ label, value, sub, icon: Icon, trend, trendLabel, loading }: {
  label: string; value: string; sub?: string; icon: React.ElementType;
  trend?: number; trendLabel?: string; loading?: boolean;
}) {
  return (
    <div className="bg-elvion-card border border-white/10 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-elvion-gray text-xs font-medium uppercase tracking-wide">{label}</p>
        <Icon size={16} className="text-elvion-primary" />
      </div>
      {loading ? <Skeleton className="h-7 w-24" /> : <p className="text-2xl font-bold text-white">{value}</p>}
      {trend !== undefined && (
        <p className={`text-xs flex items-center gap-0.5 ${clrPct(trend)}`}>
          {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          {fmtPct(trend, true)} {trendLabel}
        </p>
      )}
      {sub && <p className="text-xs text-elvion-gray">{sub}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────
// TOOLTIP FORMATTERS
// ─────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CurrencyTooltip(props: any) {
  const { active, payload, label, currency } = props as {
    active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string }>;
    label?: string; currency: Currency;
  };
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-elvion-card border border-white/10 rounded-lg p-3 text-xs shadow-xl">
      <p className="text-white font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={p.name ?? i} style={{ color: p.color ?? "#fff" }}>
          {p.name}: {fmtCurrency(Number(p.value ?? 0), currency)}
        </p>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// EXPENSE ENTRY FORM
// ─────────────────────────────────────────────
function ExpenseForm({ currency, onSaved }: { currency: Currency; onSaved: () => void }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], vendor: "", category: "payroll", amount: "", paymentMethod: "bank_transfer", isRecurring: false, notes: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendor || !form.amount) return setError("Vendor and amount are required");
    setSaving(true); setError("");
    try {
      await fetchAPI("/finance?action=expense", {
        method: "POST",
        body: JSON.stringify({ ...form, amount: Math.round(parseFloat(form.amount) * 100), currency }),
      });
      setForm({ date: new Date().toISOString().split("T")[0], vendor: "", category: "payroll", amount: "", paymentMethod: "bank_transfer", isRecurring: false, notes: "" });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const inp = "bg-elvion-dark border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-elvion-primary w-full";
  return (
    <form onSubmit={handleSubmit} className="bg-elvion-dark/50 border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-white flex items-center gap-2"><Plus size={14} /> Add Expense</p>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-elvion-gray mb-1 block">Date</label>
          <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className={inp} />
        </div>
        <div>
          <label className="text-xs text-elvion-gray mb-1 block">Vendor</label>
          <input type="text" placeholder="Vendor name" value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} className={inp} />
        </div>
        <div>
          <label className="text-xs text-elvion-gray mb-1 block">Category</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inp}>
            {["payroll", "software", "marketing", "office", "legal", "other"].map(c => (
              <option key={c} value={c} className="bg-elvion-card capitalize">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-elvion-gray mb-1 block">Amount ({currency === "PKR" ? "₨" : "$"})</label>
          <input type="number" step="0.01" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className={inp} />
        </div>
        <div>
          <label className="text-xs text-elvion-gray mb-1 block">Payment Method</label>
          <select value={form.paymentMethod} onChange={e => setForm(f => ({ ...f, paymentMethod: e.target.value }))} className={inp}>
            {["bank_transfer", "cash", "credit_card", "check"].map(m => (
              <option key={m} value={m} className="bg-elvion-card">{m.replace("_", " ")}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <input type="checkbox" id="recurring" checked={form.isRecurring} onChange={e => setForm(f => ({ ...f, isRecurring: e.target.checked }))} className="accent-elvion-primary" />
          <label htmlFor="recurring" className="text-xs text-elvion-gray">Recurring expense</label>
        </div>
      </div>
      <div>
        <label className="text-xs text-elvion-gray mb-1 block">Notes</label>
        <input type="text" placeholder="Optional notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inp} />
      </div>
      <button type="submit" disabled={saving} className="w-full py-2 bg-elvion-primary text-black text-sm font-semibold rounded-lg hover:bg-elvion-accent disabled:opacity-50 transition-colors">
        {saving ? "Saving..." : "Add Expense"}
      </button>
    </form>
  );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function FinanceDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [currency, setCurrency] = useState<Currency>("PKR");

  type DatePreset = "this-month" | "this-year" | "last-month" | "last-3-months" | "last-6-months" | "last-year" | "custom";
  const [datePreset, setDatePreset] = useState<DatePreset>("this-year");
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  const presetOptions: { value: DatePreset; label: string }[] = [
    { value: "this-month",     label: "Current Month" },
    { value: "this-year",      label: "This Year" },
    { value: "last-month",     label: "Last Month" },
    { value: "last-3-months",  label: "Last 3 Months" },
    { value: "last-6-months",  label: "Last 6 Months" },
    { value: "last-year",      label: "Last Year" },
    { value: "custom",         label: "Custom Range" },
  ];

  function presetToRange(preset: DatePreset): DateRange {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    if (preset === "this-month") {
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      return { startDate: fmt(first), endDate: fmt(today) };
    }
    if (preset === "this-year") {
      return { startDate: fmt(new Date(today.getFullYear(), 0, 1)), endDate: fmt(today) };
    }
    if (preset === "last-month") {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const last  = new Date(today.getFullYear(), today.getMonth(), 0);
      return { startDate: fmt(first), endDate: fmt(last) };
    }
    if (preset === "last-3-months") {
      const first = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      return { startDate: fmt(first), endDate: fmt(today) };
    }
    if (preset === "last-6-months") {
      const first = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      return { startDate: fmt(first), endDate: fmt(today) };
    }
    if (preset === "last-year") {
      const y = today.getFullYear() - 1;
      return { startDate: fmt(new Date(y, 0, 1)), endDate: fmt(new Date(y, 11, 31)) };
    }
    return { startDate: fmt(new Date(today.getFullYear(), 0, 1)), endDate: fmt(today) };
  }

  const [dateRange, setDateRange] = useState<DateRange>(() => presetToRange("this-year"));

  // Data state
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [cashflow, setCashflow] = useState<CashflowData | null>(null);
  const [pl, setPL] = useState<PLData | null>(null);
  const [revBreakdown, setRevBreakdown] = useState<RevenueBreakdown | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [aging, setAging] = useState<InvoiceAging | null>(null);
  const [projects, setProjects] = useState<ProjectProfit[]>([]);
  const [taxEntries, setTaxEntries] = useState<TaxEntry[]>([]);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);

  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingTab, setLoadingTab] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Budget form state
  const [budgetForm, setBudgetForm] = useState({ category: "payroll", plannedAmount: "", year: new Date().getFullYear().toString(), month: (new Date().getMonth() + 1).toString() });
  const [savingBudget, setSavingBudget] = useState(false);

  // Tax form state
  const [taxForm, setTaxForm] = useState({ quarter: "1", year: new Date().getFullYear().toString(), estimatedLiability: "", amountSetAside: "", notes: "" });
  const [savingTax, setSavingTax] = useState(false);

  // Forecast scenario
  const [forecastScenario, setForecastScenario] = useState<"conservative" | "baseline" | "optimistic">("baseline");
  const [whatIfClients, setWhatIfClients] = useState(0);
  const [whatIfRate, setWhatIfRate] = useState(1500);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_admin)) router.push("/login");
  }, [isLoading, isAuthenticated, user, router]);

  const fetchMetrics = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchAPI(`/metrics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&currency=${currency}`);
      setMetrics(data);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); setLoadingMetrics(false); }
  }, [dateRange, currency]);

  const fetchTabData = useCallback(async (tab: Tab) => {
    setLoadingTab(true);
    try {
      const qs = `startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&currency=${currency}`;
      if (tab === "cashflow") {
        const [cf] = await Promise.all([
          fetchAPI(`/finance?action=cashflow&${qs}`),
        ]);
        setCashflow(cf);
      }
      if (tab === "plrevenue") {
        const [plData, rev] = await Promise.all([
          fetchAPI(`/finance?action=pl&${qs}`),
          fetchAPI(`/finance?action=revenue-breakdown&${qs}`),
        ]);
        setPL(plData); setRevBreakdown(rev);
      }
      if (tab === "expensesbudget") {
        const [exp, bud] = await Promise.all([
          fetchAPI(`/finance?action=expenses&${qs}`),
          fetchAPI(`/finance?action=budgets&year=${new Date().getFullYear()}&currency=${currency}`),
        ]);
        setExpenses(exp); setBudgets(bud);
      }
      if (tab === "billing") {
        const [ag, proj] = await Promise.all([
          fetchAPI(`/finance?action=invoice-aging&currency=${currency}`),
          fetchAPI(`/finance?action=project-profitability&currency=${currency}`),
        ]);
        setAging(ag); setProjects(proj);
      }
      if (tab === "payroll") {
        const now = new Date();
        const pr = await fetchAPI(`/finance?action=payroll&year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
        setPayroll(Array.isArray(pr) ? pr : []);
      }
      if (tab === "tax") {
        const [tax, al] = await Promise.all([
          fetchAPI(`/finance?action=tax-entries&year=${new Date().getFullYear()}`),
          fetchAPI(`/finance?action=alerts`),
        ]);
        setTaxEntries(Array.isArray(tax) ? tax : []); setAlerts(Array.isArray(al) ? al : []);
      }
      if (tab === "forecasting") {
        const fc = await fetchAPI(`/finance?action=forecast&currency=${currency}`);
        setForecast(fc);
      }
      if (tab === "overview") {
        const al = await fetchAPI(`/finance?action=alerts`);
        setAlerts(Array.isArray(al) ? al : []);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingTab(false); }
  }, [dateRange, currency]);

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) { fetchMetrics(); fetchTabData("overview"); }
  }, [isAuthenticated, user, fetchMetrics, fetchTabData]);

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      fetchMetrics();
      fetchTabData(activeTab);
    }
  }, [dateRange, currency]);

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) fetchTabData(activeTab);
  }, [activeTab]);

  // Close preset dropdown on outside click
  useEffect(() => {
    if (!showPresetMenu) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-preset-menu]")) setShowPresetMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showPresetMenu]);

  const deleteExpense = async (id: number) => {
    try {
      await fetchAPI("/finance?action=delete-expense", { method: "POST", body: JSON.stringify({ id }) });
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (e) { console.error(e); }
  };

  const saveBudget = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingBudget(true);
    try {
      await fetchAPI("/finance?action=budget", {
        method: "POST",
        body: JSON.stringify({ ...budgetForm, plannedAmount: Math.round(parseFloat(budgetForm.plannedAmount) * 100), year: parseInt(budgetForm.year), month: parseInt(budgetForm.month), currency }),
      });
      setBudgetForm({ category: "payroll", plannedAmount: "", year: new Date().getFullYear().toString(), month: (new Date().getMonth() + 1).toString() });
      fetchTabData("expensesbudget");
    } catch (e) { console.error(e); }
    finally { setSavingBudget(false); }
  };

  const saveTax = async (e: React.FormEvent) => {
    e.preventDefault(); setSavingTax(true);
    try {
      await fetchAPI("/finance?action=tax-entry", {
        method: "POST",
        body: JSON.stringify({ ...taxForm, quarter: parseInt(taxForm.quarter), year: parseInt(taxForm.year), estimatedLiability: Math.round(parseFloat(taxForm.estimatedLiability) * 100), amountSetAside: Math.round(parseFloat(taxForm.amountSetAside || "0") * 100) }),
      });
      setTaxForm({ quarter: "1", year: new Date().getFullYear().toString(), estimatedLiability: "", amountSetAside: "", notes: "" });
      fetchTabData("tax");
    } catch (e) { console.error(e); }
    finally { setSavingTax(false); }
  };

  const resolveAlert = async (id: number) => {
    try {
      await fetchAPI("/finance?action=alert-resolve", { method: "POST", body: JSON.stringify({ alertId: id }) });
      setAlerts(prev => prev.filter(a => a.id !== id));
    } catch (e) { console.error(e); }
  };

  const exportCSV = (data: Record<string, unknown>[], filename: string) => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csv = [keys.join(","), ...data.map(row => keys.map(k => JSON.stringify(row[k] ?? "")).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (isLoading || loadingMetrics) {
    return (
      <div className="min-h-screen bg-elvion-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary" />
      </div>
    );
  }
  if (!isAuthenticated || !user?.is_admin) return null;

  const fmt = (cents: number) => fmtCurrency(cents, currency);
  const inp = "bg-elvion-dark border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-elvion-primary w-full";

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "cashflow", label: "Cash & Burn", icon: TrendingUp },
    { id: "plrevenue", label: "P&L & Revenue", icon: BarChart3 },
    { id: "expensesbudget", label: "Expenses & Budget", icon: DollarSign },
    { id: "billing", label: "Clients & Projects", icon: Briefcase },
    { id: "payroll", label: "Team & Payroll", icon: Users },
    { id: "tax", label: "Tax & Compliance", icon: Shield },
    { id: "forecasting", label: "Forecasting", icon: Target },
    { id: "reports", label: "Reports", icon: FileText },
  ] as const;

  // ── EXPENSE CATEGORY CHART DATA ──────────────────────────────────────────
  const expensePieData = Object.entries(
    expenses.reduce((acc: Record<string, number>, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const totalExpensesAmt = expensePieData.reduce((s, d) => s + d.value, 0);

  // ── BUDGET VS ACTUAL ─────────────────────────────────────────────────────
  const budgetVsActual = budgets.map(b => {
    const actual = expenses.filter(e => e.category === b.category).reduce((s, e) => s + e.amount, 0);
    const variance = actual - b.plannedAmount;
    const variancePct = b.plannedAmount > 0 ? (variance / b.plannedAmount) * 100 : 0;
    return { category: b.category, budget: b.plannedAmount, actual, variance, variancePct };
  });

  // ── FORECAST CHART DATA ───────────────────────────────────────────────────
  const forecastChartData = forecast
    ? [
        ...forecast.historical.labels.map((label, i) => ({
          label, historical: forecast.historical.revenue[i], type: "historical",
        })),
        ...forecast.forecast.labels.slice(0, 6).map((label, i) => ({
          label,
          [forecastScenario]: forecast.forecast.scenarios[forecastScenario][i],
          type: "forecast",
        })),
      ]
    : [];

  // ── WHAT-IF IMPACT ────────────────────────────────────────────────────────
  const whatIfImpact = whatIfClients * whatIfRate * 100; // cents/month
  const whatIfAnnual = whatIfImpact * 12;

  return (
    <div className="min-h-screen bg-elvion-dark">
      {/* ── HEADER ── */}
      <div className="bg-elvion-card border-b border-white/10 sticky top-0 z-10 px-6 py-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Financial Dashboard</h1>
            <p className="text-elvion-gray text-xs">Advanced financial intelligence — Elvion Solutions</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Date preset dropdown */}
            <div className="relative" data-preset-menu>
              <button
                onClick={() => setShowPresetMenu(v => !v)}
                className="flex items-center gap-2 bg-elvion-dark border border-white/10 rounded-lg px-3 py-2 text-xs text-white hover:border-elvion-primary transition-colors min-w-[160px] justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-elvion-gray" />
                  <span>{presetOptions.find(p => p.value === datePreset)?.label}</span>
                </div>
                <ChevronDown size={12} className={`text-elvion-gray transition-transform ${showPresetMenu ? "rotate-180" : ""}`} />
              </button>
              {showPresetMenu && (
                <div className="absolute right-0 top-full mt-1 bg-elvion-card border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden min-w-[180px]">
                  {presetOptions.map(opt => (
                    <button key={opt.value}
                      onClick={() => {
                        setDatePreset(opt.value);
                        if (opt.value !== "custom") setDateRange(presetToRange(opt.value));
                        setShowPresetMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs transition-colors hover:bg-white/5 ${datePreset === opt.value ? "text-elvion-primary font-semibold" : "text-white"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Custom date inputs — shown only when "Custom Range" is selected */}
            {datePreset === "custom" && (
              <div className="flex items-center gap-1 bg-elvion-dark border border-white/10 rounded-lg px-3 py-2">
                <input type="date" value={dateRange.startDate} onChange={e => setDateRange(d => ({ ...d, startDate: e.target.value }))}
                  className="bg-transparent text-white text-xs border-none outline-none" />
                <span className="text-elvion-gray text-xs">—</span>
                <input type="date" value={dateRange.endDate} onChange={e => setDateRange(d => ({ ...d, endDate: e.target.value }))}
                  className="bg-transparent text-white text-xs border-none outline-none" />
              </div>
            )}
            {/* Date range display (non-custom) */}
            {datePreset !== "custom" && (
              <div className="flex items-center gap-1 bg-elvion-dark/50 border border-white/5 rounded-lg px-3 py-2 text-xs text-elvion-gray select-none">
                {dateRange.startDate} — {dateRange.endDate}
              </div>
            )}
            {/* Currency toggle */}
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              {(["USD", "PKR"] as Currency[]).map(c => (
                <button key={c} onClick={() => setCurrency(c)}
                  className={`px-3 py-2 text-xs font-semibold transition-colors ${currency === c ? "bg-elvion-primary text-black" : "bg-elvion-dark text-white hover:bg-white/5"}`}>
                  {c}
                </button>
              ))}
            </div>
            <button onClick={() => { fetchMetrics(); fetchTabData(activeTab); }} disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 bg-elvion-primary text-black text-xs font-semibold rounded-lg hover:bg-elvion-accent disabled:opacity-50">
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* ── MODULE 1: KPI BAR ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            { label: "Total Revenue", value: metrics ? fmt(metrics.revenue.total) : "—", icon: TrendingUp, trend: metrics?.revenue.growthPercent, trendLabel: "vs prev period" },
            { label: "Total Expenses", value: metrics ? fmt(metrics.expenses.total) : "—", icon: TrendingDown, trend: metrics ? -(metrics.expenses.monthlyBurnRate / metrics.expenses.total * 10) : undefined },
            { label: "Net Profit", value: metrics ? fmt(metrics.profit.netProfit) : "—", icon: DollarSign, sub: metrics ? `Margin: ${fmtPct(metrics.profit.profitMargin)}` : undefined },
            { label: "MRR", value: metrics ? fmt(metrics.revenue.monthlyRecurring) : "—", icon: Zap },
            { label: "Cash on Hand", value: metrics ? fmt(metrics.liquidity.cashOnHand) : "—", icon: Activity },
            { label: "Accounts Rec.", value: metrics ? fmt(metrics.liquidity.accountsReceivable) : "—", icon: Clock },
            { label: "Accounts Pay.", value: metrics ? fmt(metrics.liquidity.accountsPayable) : "—", icon: AlertCircle },
            { label: "Burn Rate/mo", value: metrics ? fmt(metrics.expenses.monthlyBurnRate) : "—", icon: TrendingDown, sub: metrics ? `Runway: ${metrics.health.runway >= 999 ? "∞" : metrics.health.runway.toFixed(1)}mo` : undefined },
          ].map(kpi => (
            <KPICard key={kpi.label} {...kpi} loading={loadingMetrics} />
          ))}
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
          <div className="flex overflow-x-auto border-b border-white/10 scrollbar-none">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                  activeTab === tab.id ? "text-elvion-primary border-elvion-primary" : "text-elvion-gray border-transparent hover:text-white"
                }`}>
                <tab.icon size={13} />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 min-h-96">
            {loadingTab && (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-elvion-primary" />
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 1: OVERVIEW — Modules 1 & 13
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "overview" && metrics && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Health Gauge */}
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-4">Financial Health Score</p>
                    <div className="flex items-center gap-4">
                      <HealthGauge score={metrics.health.healthScore} color={metrics.health.healthScoreColor} />
                      <div className="space-y-2 flex-1">
                        <p className="text-lg font-bold text-white">
                          {metrics.health.healthScore >= 80 ? "Excellent" : metrics.health.healthScore >= 65 ? "Good" : metrics.health.healthScore >= 50 ? "Fair" : "At Risk"}
                        </p>
                        {[
                          { label: "Runway", val: Math.min(25, (metrics.health.runway / 12) * 25), max: 25 },
                          { label: "Profit Margin", val: Math.min(20, (metrics.profit.profitMargin / 30) * 20), max: 20 },
                          { label: "Revenue Growth", val: Math.min(20, ((metrics.revenue.growthPercent + 20) / 40) * 20), max: 20 },
                          { label: "Collection Eff.", val: Math.min(15, (metrics.health.collectionEfficiency / 95) * 15), max: 15 },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="flex justify-between text-xs mb-0.5">
                              <span className="text-elvion-gray">{item.label}</span>
                              <span className="text-white">{item.val.toFixed(0)}/{item.max}</span>
                            </div>
                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-elvion-primary rounded-full" style={{ width: `${(item.val / item.max) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Revenue Trend Sparkline */}
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-1">12-Month Revenue Trend</p>
                    <p className="text-xs text-elvion-gray mb-3">With 3-month forecast</p>
                    <ResponsiveContainer width="100%" height={120}>
                      <AreaChart data={[
                        ...metrics.revenue.last12Months.map((v, i) => ({ label: metrics.revenue.last12Labels?.[i] ?? `M${i + 1}`, value: v, type: "actual" })),
                        ...metrics.revenue.forecast3Months.map((v, i) => ({ label: `F${i + 1}`, forecast: v, type: "forecast" })),
                      ]}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D28D" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00D28D" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="label" tick={{ fill: "#A1A1A1", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <Tooltip content={(props) => <CurrencyTooltip {...props} currency={currency} />} />
                        <Area type="monotone" dataKey="value" stroke="#00D28D" fill="url(#revGrad)" strokeWidth={2} dot={false} name="Revenue" />
                        <Area type="monotone" dataKey="forecast" stroke="#3B82F6" fill="none" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Forecast" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Key Metrics Summary */}
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5 space-y-3">
                    <p className="text-sm font-semibold text-white mb-4">Key Ratios</p>
                    {[
                      { label: "Profit Margin", value: fmtPct(metrics.profit.profitMargin), good: metrics.profit.profitMargin >= 15 },
                      { label: "Collection Eff.", value: fmtPct(metrics.health.collectionEfficiency), good: metrics.health.collectionEfficiency >= 90 },
                      { label: "Payroll % Rev.", value: fmtPct(metrics.health.payrollPct), good: metrics.health.payrollPct <= 45 },
                      { label: "Conc. Risk", value: fmtPct(metrics.health.concentrationRisk), good: metrics.health.concentrationRisk <= 40 },
                      { label: "DSO", value: `${metrics.health.dso.toFixed(0)} days`, good: metrics.health.dso <= 45 },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between text-sm">
                        <span className="text-elvion-gray">{r.label}</span>
                        <span className={r.good ? "text-green-400 font-semibold" : "text-yellow-400 font-semibold"}>{r.value}</span>
                      </div>
                    ))}
                    <RunwayBar months={metrics.health.runway >= 999 ? 24 : metrics.health.runway} />
                  </div>
                </div>

                {/* Alert Center */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-yellow-400" /> Alert Center
                    {alerts.length > 0 && <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{alerts.length}</span>}
                  </p>
                  {alerts.length === 0 ? (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle size={16} /> No active financial alerts — all metrics are healthy
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {alerts.map(a => (
                        <div key={a.id} className={`flex items-start justify-between p-3 rounded-lg border ${
                          a.severity === "critical" ? "border-red-500/30 bg-red-500/5" :
                          a.severity === "warning" ? "border-yellow-500/30 bg-yellow-500/5" :
                          "border-blue-500/30 bg-blue-500/5"
                        }`}>
                          <div className="flex items-start gap-2 flex-1">
                            {a.severity === "critical" ? <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" /> :
                             a.severity === "warning" ? <AlertTriangle size={14} className="text-yellow-400 mt-0.5 shrink-0" /> :
                             <Eye size={14} className="text-blue-400 mt-0.5 shrink-0" />}
                            <div>
                              <p className="text-white text-xs font-medium">{a.message}</p>
                              <p className="text-elvion-gray text-xs">{new Date(a.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <button onClick={() => resolveAlert(a.id)} className="text-elvion-gray hover:text-white text-xs px-2 py-1 rounded border border-white/10 hover:border-white/20 transition-colors ml-2">
                            Resolve
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 2: CASH & BURN — Modules 2 & 3
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "cashflow" && cashflow && metrics && (
              <div className="space-y-6">
                {/* Burn rate hero cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-elvion-gray mb-1">Monthly Burn Rate</p>
                    <p className="text-2xl font-bold text-red-400">{fmt(metrics.expenses.monthlyBurnRate)}</p>
                    <p className="text-xs text-elvion-gray mt-1">Total monthly expenses</p>
                  </div>
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-elvion-gray mb-1">Runway</p>
                    <p className={`text-2xl font-bold ${metrics.health.runwayHealthColor === "green" ? "text-green-400" : metrics.health.runwayHealthColor === "yellow" ? "text-yellow-400" : "text-red-400"}`}>
                      {metrics.health.runway >= 999 ? "∞" : `${metrics.health.runway.toFixed(1)}mo`}
                    </p>
                    <p className="text-xs text-elvion-gray mt-1">Cash on hand ÷ burn</p>
                  </div>
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-elvion-gray mb-1">Break-Even Revenue</p>
                    <p className="text-2xl font-bold text-blue-400">{fmt(metrics.expenses.monthlyBurnRate)}</p>
                    <p className="text-xs text-elvion-gray mt-1">To cover all costs</p>
                  </div>
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-4">
                    <p className="text-xs text-elvion-gray mb-1">Cashflow Health</p>
                    <p className={`text-2xl font-bold ${cashflow.summary.cashflowHealthScore >= 60 ? "text-green-400" : cashflow.summary.cashflowHealthScore >= 40 ? "text-yellow-400" : "text-red-400"}`}>
                      {cashflow.summary.cashflowHealthScore}/100
                    </p>
                  </div>
                </div>

                <RunwayBar months={metrics.health.runway >= 999 ? 24 : metrics.health.runway} />

                {/* Cashflow Bar Chart */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4">12-Month Inflow vs Outflow</p>
                  <ResponsiveContainer width="100%" height={260}>
                    <ComposedChart data={cashflow.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: "#A1A1A1", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#A1A1A1", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                      <Tooltip content={(props) => <CurrencyTooltip {...props} currency={currency} />} />
                      <Legend wrapperStyle={{ color: "#A1A1A1", fontSize: 12 }} />
                      <Bar dataKey="inflow" name="Inflow" fill="#00D28D" radius={[3, 3, 0, 0]} opacity={0.85} />
                      <Bar dataKey="outflow" name="Outflow" fill="#EF4444" radius={[3, 3, 0, 0]} opacity={0.85} />
                      <Line type="monotone" dataKey="net" name="Net" stroke="#F59E0B" strokeWidth={2} dot={false} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                {/* Running Balance */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-1">Cumulative Cash Balance</p>
                  <p className="text-xs text-elvion-gray mb-4">Running balance over 12 months + 90-day projection</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={[
                      ...cashflow.monthly.map(d => ({ label: d.month, balance: d.runningBalance })),
                      ...cashflow.projection.map(d => ({ label: d.month, projected: d.net })),
                    ]}>
                      <defs>
                        <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="label" tick={{ fill: "#A1A1A1", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#A1A1A1", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                      <Tooltip content={(props) => <CurrencyTooltip {...props} currency={currency} />} />
                      <Area type="monotone" dataKey="balance" stroke="#3B82F6" fill="url(#balGrad)" strokeWidth={2} dot={false} name="Balance" />
                      <Area type="monotone" dataKey="projected" stroke="#8B5CF6" fill="none" strokeWidth={2} strokeDasharray="4 4" dot={false} name="Projected" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Monthly breakdown table */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        {["Month", "Inflow", "Outflow", "Net", "Running Balance"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-elvion-gray font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cashflow.monthly.map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-2.5 text-white font-medium">{row.monthFull}</td>
                          <td className="px-4 py-2.5 text-green-400">{fmt(row.inflow)}</td>
                          <td className="px-4 py-2.5 text-red-400">{fmt(row.outflow)}</td>
                          <td className={`px-4 py-2.5 font-semibold ${row.net >= 0 ? "text-green-400" : "text-red-400"}`}>{fmt(row.net)}</td>
                          <td className={`px-4 py-2.5 font-semibold ${row.runningBalance >= 0 ? "text-white" : "text-red-400"}`}>{fmt(row.runningBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 3: P&L & REVENUE — Modules 4 & 5
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "plrevenue" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* P&L Statement */}
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-4">Profit & Loss Statement</p>
                    {pl ? (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between py-2 border-b border-white/10">
                          <span className="text-elvion-gray font-medium">Gross Revenue</span>
                          <span className="text-white font-bold">{fmt(pl.grossRevenue)}</span>
                        </div>
                        <div className="flex justify-between py-1.5 text-elvion-gray ml-3">
                          <span>— Cost of Services (COGS)</span>
                          <span className="text-red-400">({fmt(pl.cogs)})</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/10 bg-white/5 px-2 rounded">
                          <span className="text-white font-semibold">Gross Profit</span>
                          <span className={`font-bold ${pl.grossProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {fmt(pl.grossProfit)} <span className="text-xs font-normal">({fmtPct(pl.grossMargin)})</span>
                          </span>
                        </div>
                        <div className="py-2 border-b border-white/10">
                          <div className="flex justify-between mb-1">
                            <span className="text-elvion-gray font-medium">Operating Expenses</span>
                            <span className="text-white font-semibold">{fmt(pl.totalOperatingExpenses)}</span>
                          </div>
                          {Object.entries(pl.operatingExpenses).map(([cat, amt]) => (
                            <div key={cat} className="flex justify-between py-0.5 ml-3 text-elvion-gray text-xs">
                              <span className="capitalize">— {cat}</span>
                              <span>{fmt(amt)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/10">
                          <span className="text-elvion-gray font-medium">EBITDA</span>
                          <span className={`font-semibold ${pl.ebitda >= 0 ? "text-white" : "text-red-400"}`}>{fmt(pl.ebitda)}</span>
                        </div>
                        <div className={`flex justify-between py-3 px-3 rounded-lg border ${pl.netProfit >= 0 ? "bg-green-400/10 border-green-400/20" : "bg-red-400/10 border-red-400/20"}`}>
                          <span className={`font-bold text-base ${pl.netProfit >= 0 ? "text-green-300" : "text-red-300"}`}>NET {pl.netProfit >= 0 ? "PROFIT" : "LOSS"}</span>
                          <span className={`font-bold text-base ${pl.netProfit >= 0 ? "text-green-300" : "text-red-300"}`}>
                            {fmt(pl.netProfit)} <span className="text-xs font-normal">({fmtPct(pl.netMargin)})</span>
                          </span>
                        </div>
                      </div>
                    ) : <Skeleton className="h-48" />}
                  </div>

                  {/* Revenue by Service Type */}
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-4">Revenue by Service Type</p>
                    {revBreakdown ? (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={revBreakdown.byServiceType} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="revenue">
                              {revBreakdown.byServiceType.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1 mt-2">
                          {revBreakdown.byServiceType.slice(0, 5).map((s, i) => (
                            <div key={s.type} className="flex items-center gap-2 text-xs">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="text-elvion-gray flex-1">{s.type}</span>
                              <span className="text-white font-medium">{fmt(s.revenue)}</span>
                              <span className="text-elvion-gray w-10 text-right">{fmtPct(s.pct)}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : <Skeleton className="h-48" />}
                  </div>
                </div>

                {/* Top Clients */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-white">Top Revenue-Generating Clients</p>
                    {revBreakdown?.concentrationWarning && (
                      <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded">
                        <AlertTriangle size={12} /> Concentration Risk: {fmtPct(revBreakdown.topClientConcentration)}
                      </span>
                    )}
                  </div>
                  {revBreakdown ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-white/10">
                            {["#", "Client", "Revenue", "% Total", "Projects"].map(h => (
                              <th key={h} className="px-3 py-2 text-left text-elvion-gray font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {revBreakdown.byClient.map((c, i) => (
                            <tr key={c.name} className="border-b border-white/5 hover:bg-white/5">
                              <td className="px-3 py-2.5 text-elvion-gray">{i + 1}</td>
                              <td className="px-3 py-2.5 text-white font-medium">{c.name}</td>
                              <td className="px-3 py-2.5 text-elvion-primary font-semibold">{fmt(c.revenue)}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-2">
                                  <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-elvion-primary rounded-full" style={{ width: `${c.pct}%` }} />
                                  </div>
                                  <span className={c.pct > 40 ? "text-yellow-400" : "text-elvion-gray"}>{fmtPct(c.pct)}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-elvion-gray">{c.projectCount}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <Skeleton className="h-32" />}
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 4: EXPENSES & BUDGET — Modules 6 & 8
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "expensesbudget" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Expense Donut */}
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-white">Expense Breakdown</p>
                      <button onClick={() => exportCSV(expenses.map(e => ({ id: e.id, date: e.date, vendor: e.vendor, category: e.category, amount: e.amount / 100, currency: e.currency })), "expenses")}
                        className="flex items-center gap-1 text-xs text-elvion-gray hover:text-white">
                        <Download size={12} /> CSV
                      </button>
                    </div>
                    {expensePieData.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={180}>
                          <PieChart>
                            <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                              {expensePieData.map((entry, i) => (
                                <Cell key={i} fill={EXPENSE_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-1">
                          {expensePieData.map((d, i) => (
                            <div key={d.name} className="flex items-center gap-2 text-xs">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: EXPENSE_COLORS[d.name] || COLORS[i % COLORS.length] }} />
                              <span className="text-elvion-gray capitalize flex-1">{d.name}</span>
                              <span className="text-white font-medium">{fmt(d.value)}</span>
                              <span className="text-elvion-gray w-10 text-right">{totalExpensesAmt > 0 ? fmtPct((d.value / totalExpensesAmt) * 100) : "—"}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-elvion-gray text-sm py-8">No expense data for this period</div>
                    )}
                  </div>

                  {/* Budget vs Actual */}
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-4">Budget vs Actual</p>
                    {budgetVsActual.length > 0 ? (
                      <>
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={budgetVsActual}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="category" tick={{ fill: "#A1A1A1", fontSize: 9 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: "#A1A1A1", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                            <Tooltip formatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                            <Bar dataKey="budget" name="Budget" fill="#3B82F6" radius={[3, 3, 0, 0]} opacity={0.6} />
                            <Bar dataKey="actual" name="Actual" fill="#00D28D" radius={[3, 3, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                        <div className="space-y-1 mt-3">
                          {budgetVsActual.map(b => (
                            <div key={b.category} className="flex items-center justify-between text-xs">
                              <span className="text-elvion-gray capitalize">{b.category}</span>
                              <span className={`font-semibold ${b.variancePct <= 0 ? "text-green-400" : b.variancePct <= 10 ? "text-yellow-400" : "text-red-400"}`}>
                                {b.variancePct > 0 ? "+" : ""}{fmtPct(b.variancePct)} vs budget
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-elvion-gray text-sm py-8">Set budgets below to see comparison</div>
                    )}
                  </div>
                </div>

                {/* Budget Setup Form */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4">Set / Update Budget</p>
                  <form onSubmit={saveBudget} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Category</label>
                      <select value={budgetForm.category} onChange={e => setBudgetForm(f => ({ ...f, category: e.target.value }))} className={inp}>
                        {["payroll", "software", "marketing", "office", "legal", "other", "revenue"].map(c => (
                          <option key={c} value={c} className="bg-elvion-card capitalize">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Year</label>
                      <input type="number" value={budgetForm.year} onChange={e => setBudgetForm(f => ({ ...f, year: e.target.value }))} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Month (0=annual)</label>
                      <input type="number" min="0" max="12" value={budgetForm.month} onChange={e => setBudgetForm(f => ({ ...f, month: e.target.value }))} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Amount ({currency === "PKR" ? "₨" : "$"})</label>
                      <input type="number" step="0.01" placeholder="0.00" value={budgetForm.plannedAmount} onChange={e => setBudgetForm(f => ({ ...f, plannedAmount: e.target.value }))} className={inp} />
                    </div>
                    <button type="submit" disabled={savingBudget || !budgetForm.plannedAmount}
                      className="py-2 bg-elvion-primary text-black text-sm font-semibold rounded-lg hover:bg-elvion-accent disabled:opacity-50">
                      {savingBudget ? "Saving..." : "Save Budget"}
                    </button>
                  </form>
                </div>

                {/* Expense Entry Form */}
                <ExpenseForm currency={currency} onSaved={() => fetchTabData("expensesbudget")} />

                {/* Expense List */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Expense Log</p>
                    <span className="text-xs text-elvion-gray">{expenses.length} records</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          {["Date", "Vendor", "Category", "Amount", "Method", "Recurring", ""].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-elvion-gray font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.slice(0, 20).map(exp => (
                          <tr key={exp.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2.5 text-elvion-gray">{new Date(exp.date).toLocaleDateString()}</td>
                            <td className="px-4 py-2.5 text-white">{exp.vendor}</td>
                            <td className="px-4 py-2.5 capitalize">
                              <span className="px-2 py-0.5 rounded text-xs" style={{ background: `${EXPENSE_COLORS[exp.category]}20`, color: EXPENSE_COLORS[exp.category] || "#A1A1A1" }}>
                                {exp.category}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-red-400 font-medium">{fmt(exp.amount)}</td>
                            <td className="px-4 py-2.5 text-elvion-gray capitalize">{exp.paymentMethod?.replace("_", " ") || "—"}</td>
                            <td className="px-4 py-2.5">{exp.isRecurring ? <span className="text-blue-400">●</span> : <span className="text-elvion-gray">○</span>}</td>
                            <td className="px-4 py-2.5">
                              <button onClick={() => deleteExpense(exp.id)} className="text-red-400 hover:text-red-300 transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {expenses.length === 0 && (
                          <tr><td colSpan={7} className="px-4 py-8 text-center text-elvion-gray">No expenses recorded for this period</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 5: CLIENTS & PROJECTS — Modules 7 & 10
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "billing" && (
              <div className="space-y-6">
                {/* Invoice Status Dashboard */}
                {aging && (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: "Current (0-30d)", amount: aging.buckets.current, count: aging.bucketCounts.current, color: "text-green-400" },
                        { label: "31–60 Days", amount: aging.buckets.days30, count: aging.bucketCounts.days30, color: "text-yellow-400" },
                        { label: "61–90 Days", amount: aging.buckets.days60, count: aging.bucketCounts.days60, color: "text-orange-400" },
                        { label: "91–180 Days", amount: aging.buckets.days90, count: aging.bucketCounts.days90, color: "text-red-400" },
                        { label: "90+ Days", amount: aging.buckets.over90, count: aging.bucketCounts.over90, color: "text-red-600" },
                      ].map(b => (
                        <div key={b.label} className="bg-elvion-dark/50 border border-white/10 rounded-xl p-4">
                          <p className="text-xs text-elvion-gray mb-1">{b.label}</p>
                          <p className={`text-xl font-bold ${b.color}`}>{fmt(b.amount)}</p>
                          <p className="text-xs text-elvion-gray mt-1">{b.count} invoice{b.count !== 1 ? "s" : ""}</p>
                        </div>
                      ))}
                    </div>

                    {/* AR Aging Chart */}
                    <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                      <p className="text-sm font-semibold text-white mb-4">Accounts Receivable Aging Report</p>
                      <ResponsiveContainer width="100%" height={160}>
                        <BarChart data={[
                          { bucket: "0-30d", amount: aging.buckets.current },
                          { bucket: "31-60d", amount: aging.buckets.days30 },
                          { bucket: "61-90d", amount: aging.buckets.days60 },
                          { bucket: "91-180d", amount: aging.buckets.days90 },
                          { bucket: "180d+", amount: aging.buckets.over90 },
                        ]}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="bucket" tick={{ fill: "#A1A1A1", fontSize: 10 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#A1A1A1", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                          <Tooltip formatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                          <Bar dataKey="amount" name="Outstanding" radius={[4, 4, 0, 0]}>
                            {["#00D28D", "#F59E0B", "#EF4444", "#DC2626", "#991B1B"].map((color, i) => (
                              <Cell key={i} fill={color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Overdue Invoices Table */}
                    {aging.invoices.length > 0 && (
                      <div className="bg-elvion-dark/50 border border-white/10 rounded-xl overflow-hidden">
                        <div className="px-5 py-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-white">Outstanding Invoices</p>
                        </div>
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                              {["Invoice #", "Client", "Amount", "Due Date", "Days Overdue", "Status"].map(h => (
                                <th key={h} className="px-4 py-2.5 text-left text-elvion-gray font-medium">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {aging.invoices.sort((a, b) => b.daysOverdue - a.daysOverdue).slice(0, 10).map(inv => (
                              <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                                <td className="px-4 py-2.5 text-elvion-primary font-mono">{inv.number}</td>
                                <td className="px-4 py-2.5 text-white">{inv.user?.company || inv.user?.name || "—"}</td>
                                <td className="px-4 py-2.5 text-white font-medium">{fmt(inv.totalCents)}</td>
                                <td className="px-4 py-2.5 text-elvion-gray">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                                <td className="px-4 py-2.5">
                                  <span className={`font-semibold ${inv.daysOverdue > 60 ? "text-red-400" : inv.daysOverdue > 30 ? "text-yellow-400" : "text-elvion-gray"}`}>
                                    {inv.daysOverdue > 0 ? `${inv.daysOverdue}d` : "Current"}
                                  </span>
                                </td>
                                <td className="px-4 py-2.5">
                                  <span className={`px-2 py-0.5 rounded text-xs capitalize ${inv.status === "overdue" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                    {inv.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* Project Profitability */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Project Profitability Ranking</p>
                    <button onClick={() => exportCSV(projects.map(p => ({ ...p, revenue: p.revenue / 100, costs: p.costs / 100, grossProfit: p.grossProfit / 100 })), "project-profitability")}
                      className="flex items-center gap-1 text-xs text-elvion-gray hover:text-white">
                      <Download size={12} /> Export
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          {["Project", "Client", "Revenue", "Costs", "Gross Profit", "Margin", "Status"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-elvion-gray font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map(p => (
                          <tr key={p.id} className={`border-b border-white/5 hover:bg-white/5 ${p.isLoss ? "bg-red-500/5" : ""}`}>
                            <td className="px-4 py-2.5 text-white font-medium">{p.name}</td>
                            <td className="px-4 py-2.5 text-elvion-gray">{p.client}</td>
                            <td className="px-4 py-2.5 text-green-400">{fmt(p.revenue)}</td>
                            <td className="px-4 py-2.5 text-red-400">{fmt(p.costs)}</td>
                            <td className={`px-4 py-2.5 font-semibold ${p.grossProfit >= 0 ? "text-white" : "text-red-400"}`}>{fmt(p.grossProfit)}</td>
                            <td className="px-4 py-2.5">
                              <span className={`font-bold ${p.margin >= 30 ? "text-green-400" : p.margin >= 10 ? "text-yellow-400" : "text-red-400"}`}>
                                {fmtPct(p.margin)}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-xs capitalize ${
                                p.status === "active" ? "bg-green-500/20 text-green-400" :
                                p.status === "completed" ? "bg-blue-500/20 text-blue-400" :
                                "bg-elvion-gray/20 text-elvion-gray"
                              }`}>{p.status}</span>
                              {p.isLoss && <span className="ml-1 text-red-400 text-xs">⚠</span>}
                            </td>
                          </tr>
                        ))}
                        {projects.length === 0 && (
                          <tr><td colSpan={7} className="px-4 py-8 text-center text-elvion-gray">No project data available</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 6: TEAM & PAYROLL — Module 9
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "payroll" && (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(() => {
                    const totalPayroll = payroll.reduce((s, p) => s + p.netPay, 0);
                    const ftCount = payroll.filter(p => p.employee?.employmentType === "full_time").length;
                    const ctCount = payroll.filter(p => p.employee?.employmentType !== "full_time").length;
                    const payrollRevPct = metrics ? (totalPayroll * 100 / (metrics.revenue.total / 100)) : 0;
                    return [
                      { label: "Total Payroll (Month)", value: fmt(totalPayroll * 100), color: "text-white" },
                      { label: "Full-Time", value: `${ftCount} employees`, color: "text-blue-400" },
                      { label: "Contractors", value: `${ctCount} contractors`, color: "text-purple-400" },
                      { label: "Payroll % Revenue", value: fmtPct(payrollRevPct), color: payrollRevPct <= 45 ? "text-green-400" : "text-yellow-400" },
                    ];
                  })().map(card => (
                    <div key={card.label} className="bg-elvion-dark/50 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-elvion-gray mb-1">{card.label}</p>
                      <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Payroll table */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Payroll Records</p>
                    <button onClick={() => exportCSV(payroll.map(p => ({ name: `${p.employee?.firstName} ${p.employee?.lastName}`, type: p.employee?.employmentType, base: p.baseSalary, bonus: p.bonus, deductions: p.deductions, tax: p.tax, net: p.netPay, currency: p.currency, status: p.status })), "payroll")}
                      className="flex items-center gap-1 text-xs text-elvion-gray hover:text-white">
                      <Download size={12} /> CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                          {["Name", "Type", "Base", "Bonus", "Deductions", "Tax", "Net Pay", "Status"].map(h => (
                            <th key={h} className="px-4 py-2.5 text-left text-elvion-gray font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {payroll.map(p => (
                          <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2.5 text-white font-medium">{p.employee?.firstName} {p.employee?.lastName}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-xs capitalize ${p.employee?.employmentType === "full_time" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
                                {p.employee?.employmentType?.replace("_", " ") || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-elvion-gray">{fmt(p.baseSalary * 100)}</td>
                            <td className="px-4 py-2.5 text-green-400">{p.bonus > 0 ? fmt(p.bonus * 100) : "—"}</td>
                            <td className="px-4 py-2.5 text-red-400">{p.deductions > 0 ? fmt(p.deductions * 100) : "—"}</td>
                            <td className="px-4 py-2.5 text-yellow-400">{fmt(p.tax * 100)}</td>
                            <td className="px-4 py-2.5 text-white font-semibold">{fmt(p.netPay * 100)}</td>
                            <td className="px-4 py-2.5">
                              <span className={`px-2 py-0.5 rounded text-xs ${p.status === "paid" ? "bg-green-500/20 text-green-400" : p.status === "processed" ? "bg-blue-500/20 text-blue-400" : "bg-elvion-gray/20 text-elvion-gray"}`}>
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {payroll.length === 0 && (
                          <tr><td colSpan={8} className="px-4 py-8 text-center text-elvion-gray">No payroll records for this period</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payroll breakdown chart */}
                {payroll.length > 0 && (
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-4">Payroll by Employee</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={payroll.slice(0, 10).map(p => ({
                        name: `${p.employee?.firstName?.charAt(0)}. ${p.employee?.lastName}`,
                        net: p.netPay * 100,
                        tax: p.tax * 100,
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: "#A1A1A1", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#A1A1A1", fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                        <Tooltip formatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                        <Legend wrapperStyle={{ color: "#A1A1A1", fontSize: 11 }} />
                        <Bar dataKey="net" name="Net Pay" fill="#00D28D" radius={[3, 3, 0, 0]} stackId="a" />
                        <Bar dataKey="tax" name="Tax" fill="#F59E0B" radius={[3, 3, 0, 0]} stackId="a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 7: TAX & COMPLIANCE — Module 11
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "tax" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(() => {
                    const totalLiability = taxEntries.reduce((s, t) => s + t.estimatedLiability, 0);
                    const totalSetAside = taxEntries.reduce((s, t) => s + t.amountSetAside, 0);
                    const gap = totalLiability - totalSetAside;
                    return [
                      { label: "Est. Tax Liability", value: fmt(totalLiability), color: "text-red-400" },
                      { label: "Amount Set Aside", value: fmt(totalSetAside), color: "text-green-400" },
                      { label: gap > 0 ? "Provision Gap" : "Over-Provisioned", value: fmt(Math.abs(gap)), color: gap > 0 ? "text-yellow-400" : "text-green-400" },
                    ];
                  })().map(c => (
                    <div key={c.label} className="bg-elvion-dark/50 border border-white/10 rounded-xl p-4">
                      <p className="text-xs text-elvion-gray mb-1">{c.label}</p>
                      <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
                    </div>
                  ))}
                </div>

                {/* Quarterly Tax Table */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10">
                    <p className="text-sm font-semibold text-white">Quarterly Tax Schedule</p>
                  </div>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/5">
                        {["Quarter", "Year", "Est. Liability", "Set Aside", "Gap", "Coverage", "Notes"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-elvion-gray font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {taxEntries.map(t => {
                        const gap = t.estimatedLiability - t.amountSetAside;
                        const coverage = t.estimatedLiability > 0 ? (t.amountSetAside / t.estimatedLiability) * 100 : 100;
                        return (
                          <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2.5 text-white font-medium">Q{t.quarter}</td>
                            <td className="px-4 py-2.5 text-elvion-gray">{t.year}</td>
                            <td className="px-4 py-2.5 text-red-400">{fmt(t.estimatedLiability)}</td>
                            <td className="px-4 py-2.5 text-green-400">{fmt(t.amountSetAside)}</td>
                            <td className={`px-4 py-2.5 font-semibold ${gap > 0 ? "text-yellow-400" : "text-green-400"}`}>
                              {gap > 0 ? `-${fmt(gap)}` : `+${fmt(Math.abs(gap))}`}
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full ${coverage >= 100 ? "bg-green-400" : coverage >= 75 ? "bg-yellow-400" : "bg-red-400"}`}
                                    style={{ width: `${Math.min(100, coverage)}%` }} />
                                </div>
                                <span className="text-elvion-gray">{fmtPct(coverage)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-elvion-gray truncate max-w-32">{t.notes || "—"}</td>
                          </tr>
                        );
                      })}
                      {taxEntries.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-elvion-gray">No tax entries — add them below</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Tax Entry Form */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4">Add / Update Tax Entry</p>
                  <form onSubmit={saveTax} className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Quarter</label>
                      <select value={taxForm.quarter} onChange={e => setTaxForm(f => ({ ...f, quarter: e.target.value }))} className={inp}>
                        {["1", "2", "3", "4"].map(q => <option key={q} value={q} className="bg-elvion-card">Q{q}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Year</label>
                      <input type="number" value={taxForm.year} onChange={e => setTaxForm(f => ({ ...f, year: e.target.value }))} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Est. Liability ({currency === "PKR" ? "₨" : "$"})</label>
                      <input type="number" step="0.01" placeholder="0.00" value={taxForm.estimatedLiability} onChange={e => setTaxForm(f => ({ ...f, estimatedLiability: e.target.value }))} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Amount Set Aside</label>
                      <input type="number" step="0.01" placeholder="0.00" value={taxForm.amountSetAside} onChange={e => setTaxForm(f => ({ ...f, amountSetAside: e.target.value }))} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs text-elvion-gray mb-1 block">Notes</label>
                      <input type="text" placeholder="e.g. FBR Q1 2026" value={taxForm.notes} onChange={e => setTaxForm(f => ({ ...f, notes: e.target.value }))} className={inp} />
                    </div>
                    <div className="flex items-end">
                      <button type="submit" disabled={savingTax || !taxForm.estimatedLiability}
                        className="w-full py-2 bg-elvion-primary text-black text-sm font-semibold rounded-lg hover:bg-elvion-accent disabled:opacity-50">
                        {savingTax ? "Saving..." : "Save Entry"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Compliance Checklist */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4">Year-End Compliance Checklist</p>
                  <div className="space-y-2">
                    {[
                      { task: "File annual income tax return (FBR)", done: false },
                      { task: "Submit quarterly GST/sales tax returns", done: false },
                      { task: "Prepare annual financial statements", done: false },
                      { task: "Reconcile payroll tax deductions", done: false },
                      { task: "Review and file withholding tax", done: false },
                      { task: "Archive all receipts and invoices", done: false },
                    ].map(item => (
                      <div key={item.task} className="flex items-center gap-3 text-sm">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${item.done ? "bg-elvion-primary border-elvion-primary" : "border-white/20"}`}>
                          {item.done && <CheckCircle size={10} className="text-black" />}
                        </div>
                        <span className={item.done ? "text-elvion-gray line-through" : "text-white"}>{item.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 8: FORECASTING — Module 12
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "forecasting" && (
              <div className="space-y-6">
                {/* Scenario selector */}
                <div className="flex gap-3">
                  {(["conservative", "baseline", "optimistic"] as const).map(s => (
                    <button key={s} onClick={() => setForecastScenario(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                        forecastScenario === s
                          ? s === "optimistic" ? "bg-purple-500 text-white" : s === "conservative" ? "bg-blue-500 text-white" : "bg-green-500 text-white"
                          : "bg-elvion-dark border border-white/10 text-elvion-gray hover:text-white"
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>

                {/* Forecast chart */}
                {forecast && (
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <p className="text-sm font-semibold text-white mb-1">12-Month Revenue Forecast — <span className="capitalize text-elvion-primary">{forecastScenario}</span> Scenario</p>
                    <p className="text-xs text-elvion-gray mb-4">Historical data + linear regression projection</p>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={forecastChartData}>
                        <defs>
                          <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00D28D" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#00D28D" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="fcastGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="label" tick={{ fill: "#A1A1A1", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: "#A1A1A1", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v: unknown) => fmtCurrency(Number(v), currency)} />
                        <Tooltip content={(props) => <CurrencyTooltip {...props} currency={currency} />} />
                        <Legend wrapperStyle={{ color: "#A1A1A1", fontSize: 11 }} />
                        <Area type="monotone" dataKey="historical" name="Historical" stroke="#00D28D" fill="url(#histGrad)" strokeWidth={2} dot={{ fill: "#00D28D", r: 3 }} connectNulls={false} />
                        <Area type="monotone" dataKey={forecastScenario} name="Forecast" stroke="#8B5CF6" fill="url(#fcastGrad)" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#8B5CF6", r: 3 }} connectNulls={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Scenario comparison */}
                {forecast && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(["conservative", "baseline", "optimistic"] as const).map(scenario => {
                      const total = forecast.forecast.scenarios[scenario].reduce((s, v) => s + v, 0);
                      const colors = { conservative: "text-blue-400 border-blue-400/20", baseline: "text-green-400 border-green-400/20", optimistic: "text-purple-400 border-purple-400/20" };
                      return (
                        <div key={scenario} className={`bg-elvion-dark/50 border rounded-xl p-5 ${colors[scenario].split(" ")[1]}`}>
                          <p className={`text-sm font-semibold capitalize mb-2 ${colors[scenario].split(" ")[0]}`}>{scenario}</p>
                          <p className="text-2xl font-bold text-white">{fmt(total)}</p>
                          <p className="text-xs text-elvion-gray mt-1">12-month projected revenue</p>
                          <p className="text-xs text-elvion-gray mt-2">Monthly avg: {fmt(total / 12)}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* What-If Calculator */}
                <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                  <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><Zap size={14} className="text-yellow-400" /> What-If Calculator</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs text-elvion-gray mb-2 block">Add new retainer clients</label>
                        <div className="flex items-center gap-3">
                          <button onClick={() => setWhatIfClients(Math.max(0, whatIfClients - 1))} className="w-8 h-8 rounded-lg border border-white/10 text-white hover:bg-white/10 flex items-center justify-center">−</button>
                          <span className="text-2xl font-bold text-white w-8 text-center">{whatIfClients}</span>
                          <button onClick={() => setWhatIfClients(whatIfClients + 1)} className="w-8 h-8 rounded-lg border border-white/10 text-white hover:bg-white/10 flex items-center justify-center">+</button>
                          <span className="text-xs text-elvion-gray">clients</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-elvion-gray mb-2 block">Monthly rate per client ({currency === "PKR" ? "₨" : "$"})</label>
                        <input type="number" value={whatIfRate} onChange={e => setWhatIfRate(Number(e.target.value))}
                          className="bg-elvion-dark border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-elvion-primary w-32" />
                      </div>
                    </div>
                    <div className="bg-elvion-dark rounded-xl p-4 border border-white/10 space-y-3">
                      <p className="text-xs text-elvion-gray font-medium">Impact on Key Metrics</p>
                      {[
                        { label: "Additional Monthly Revenue", value: fmt(whatIfImpact), color: "text-green-400" },
                        { label: "Additional Annual Revenue", value: fmt(whatIfAnnual), color: "text-green-400" },
                        { label: "New Monthly MRR", value: metrics ? fmt(metrics.revenue.monthlyRecurring + whatIfImpact) : "—", color: "text-elvion-primary" },
                        { label: "New Monthly Net Profit", value: metrics ? fmt(metrics.profit.netProfit + whatIfImpact) : "—", color: "text-blue-400" },
                        { label: "Extended Runway", value: metrics && metrics.expenses.monthlyBurnRate > 0 ? `+${((whatIfImpact / metrics.expenses.monthlyBurnRate) * 1).toFixed(1)} mo/mo` : "—", color: "text-purple-400" },
                      ].map(r => (
                        <div key={r.label} className="flex justify-between text-xs">
                          <span className="text-elvion-gray">{r.label}</span>
                          <span className={`font-semibold ${r.color}`}>{r.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ════════════════════════════════════════════════
                TAB 9: REPORTS — Module 14
            ════════════════════════════════════════════════ */}
            {!loadingTab && activeTab === "reports" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      name: "Expense Report",
                      desc: "All expenses with categories, vendors, and amounts",
                      icon: DollarSign,
                      color: "text-red-400",
                      action: () => exportCSV(expenses.map(e => ({ date: new Date(e.date).toLocaleDateString(), vendor: e.vendor, category: e.category, amount: (e.amount / 100).toFixed(2), currency: e.currency, method: e.paymentMethod || "", recurring: e.isRecurring })), "expense-report"),
                    },
                    {
                      name: "P&L Summary",
                      desc: "Revenue, expenses, and net profit for the period",
                      icon: BarChart3,
                      color: "text-green-400",
                      action: () => pl && exportCSV([{ period: `${pl.period.start} to ${pl.period.end}`, grossRevenue: (pl.grossRevenue / 100).toFixed(2), cogs: (pl.cogs / 100).toFixed(2), grossProfit: (pl.grossProfit / 100).toFixed(2), grossMargin: fmtPct(pl.grossMargin), operatingExpenses: (pl.totalOperatingExpenses / 100).toFixed(2), netProfit: (pl.netProfit / 100).toFixed(2), netMargin: fmtPct(pl.netMargin) }], "pl-summary"),
                    },
                    {
                      name: "Invoice Aging",
                      desc: "Outstanding invoices grouped by age bucket",
                      icon: Clock,
                      color: "text-yellow-400",
                      action: () => aging && exportCSV(aging.invoices.map(i => ({ number: i.number, client: i.user?.company || i.user?.name || "", amount: (i.totalCents / 100).toFixed(2), dueDate: i.dueDate ? new Date(i.dueDate).toLocaleDateString() : "", daysOverdue: i.daysOverdue, status: i.status })), "invoice-aging"),
                    },
                    {
                      name: "Project Profitability",
                      desc: "Revenue, costs, and margins for all projects",
                      icon: Briefcase,
                      color: "text-blue-400",
                      action: () => exportCSV(projects.map(p => ({ project: p.name, client: p.client, revenue: (p.revenue / 100).toFixed(2), costs: (p.costs / 100).toFixed(2), profit: (p.grossProfit / 100).toFixed(2), margin: fmtPct(p.margin), status: p.status })), "project-profitability"),
                    },
                    {
                      name: "Payroll Export",
                      desc: "Full payroll records for the current month",
                      icon: Users,
                      color: "text-purple-400",
                      action: () => exportCSV(payroll.map(p => ({ name: `${p.employee?.firstName} ${p.employee?.lastName}`, type: p.employee?.employmentType, base: p.baseSalary, bonus: p.bonus, deductions: p.deductions, tax: p.tax, net: p.netPay, currency: p.currency, status: p.status })), "payroll"),
                    },
                    {
                      name: "Tax Entries",
                      desc: "Quarterly tax liability tracker",
                      icon: Shield,
                      color: "text-cyan-400",
                      action: () => exportCSV(taxEntries.map(t => ({ quarter: `Q${t.quarter}`, year: t.year, liability: (t.estimatedLiability / 100).toFixed(2), setAside: (t.amountSetAside / 100).toFixed(2), gap: ((t.estimatedLiability - t.amountSetAside) / 100).toFixed(2), notes: t.notes || "" })), "tax-entries"),
                    },
                  ].map(report => (
                    <button key={report.name} onClick={report.action}
                      className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all hover:bg-white/5 text-left group">
                      <div className="flex items-start justify-between mb-3">
                        <report.icon size={20} className={report.color} />
                        <Download size={14} className="text-elvion-gray group-hover:text-white transition-colors" />
                      </div>
                      <p className="text-sm font-semibold text-white mb-1">{report.name}</p>
                      <p className="text-xs text-elvion-gray">{report.desc}</p>
                      <p className="text-xs text-elvion-primary mt-3">Download CSV →</p>
                    </button>
                  ))}
                </div>

                {/* Financial Summary Snapshot */}
                {metrics && (
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-white">Period Financial Summary</p>
                      <p className="text-xs text-elvion-gray">{dateRange.startDate} → {dateRange.endDate}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Total Revenue", value: fmt(metrics.revenue.total), color: "text-green-400" },
                        { label: "Total Expenses", value: fmt(metrics.expenses.total), color: "text-red-400" },
                        { label: "Net Profit", value: fmt(metrics.profit.netProfit), color: metrics.profit.netProfit >= 0 ? "text-green-400" : "text-red-400" },
                        { label: "Profit Margin", value: fmtPct(metrics.profit.profitMargin), color: metrics.profit.profitMargin >= 15 ? "text-green-400" : "text-yellow-400" },
                        { label: "Cash on Hand", value: fmt(metrics.liquidity.cashOnHand), color: "text-blue-400" },
                        { label: "Accounts Rec.", value: fmt(metrics.liquidity.accountsReceivable), color: "text-yellow-400" },
                        { label: "Monthly Burn", value: fmt(metrics.expenses.monthlyBurnRate), color: "text-red-400" },
                        { label: "Runway", value: metrics.health.runway >= 999 ? "∞" : `${metrics.health.runway.toFixed(1)} months`, color: metrics.health.runwayHealthColor === "green" ? "text-green-400" : metrics.health.runwayHealthColor === "yellow" ? "text-yellow-400" : "text-red-400" },
                      ].map(item => (
                        <div key={item.label} className="border border-white/10 rounded-lg p-3">
                          <p className="text-xs text-elvion-gray mb-1">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => exportCSV([{
                      period: `${dateRange.startDate} to ${dateRange.endDate}`,
                      currency,
                      revenue: (metrics.revenue.total / 100).toFixed(2),
                      expenses: (metrics.expenses.total / 100).toFixed(2),
                      netProfit: (metrics.profit.netProfit / 100).toFixed(2),
                      profitMargin: fmtPct(metrics.profit.profitMargin),
                      cashOnHand: (metrics.liquidity.cashOnHand / 100).toFixed(2),
                      accountsReceivable: (metrics.liquidity.accountsReceivable / 100).toFixed(2),
                      burnRate: (metrics.expenses.monthlyBurnRate / 100).toFixed(2),
                      runway: metrics.health.runway >= 999 ? "Infinite" : metrics.health.runway.toFixed(1),
                      healthScore: metrics.health.healthScore,
                    }], "financial-summary")}
                      className="mt-4 flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black text-sm font-semibold rounded-lg hover:bg-elvion-accent">
                      <Download size={14} /> Export Full Summary
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
