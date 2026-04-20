"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Calendar,
  RefreshCw,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface FinancialMetrics {
  period: { startDate: string; endDate: string };
  currency: string;
  revenue: {
    total: number;
    monthlyRecurring: number;
    forecast3Months: number[];
    growthPercent: number;
    last12Months: number[];
  };
  expenses: {
    total: number;
    monthlyAverage: number;
    monthlyBurnRate: number;
  };
  profit: {
    netProfit: number;
    profitMargin: number;
  };
  liquidity: {
    cashOnHand: number;
    accountsReceivable: number;
    accountsPayable: number;
  };
  health: {
    runway: number;
    runwayHealthColor: string;
    collectionEfficiency: number;
    concentrationRisk: number;
    concentrationRiskLevel: string;
    healthScore: number;
    healthScoreColor: string;
  };
}

type Tab = "overview" | "cashflow" | "plrevenue" | "expensesbudget" | "billing" | "payroll" | "tax" | "forecasting" | "reports";

export default function FinanceDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [currency, setCurrency] = useState<"USD" | "PKR">("USD");
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      startDate: firstDay.toISOString().split("T")[0],
      endDate: today.toISOString().split("T")[0],
    };
  });

  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user?.is_admin)) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, user, router]);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const response = await fetchAPI(
        `/api/metrics?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}&currency=${currency}`,
        { method: "GET" }
      );
      setMetrics(response);
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      fetchMetrics();
    }
  }, [dateRange, currency, isAuthenticated]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-elvion-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user?.is_admin) {
    return null;
  }

  const formatCurrency = (cents: number): string => {
    const amount = cents / 100;
    const symbol = currency === "PKR" ? "₨" : "$";
    return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (num: number): string => {
    return `${num > 0 ? "+" : ""}${num.toFixed(1)}%`;
  };

  return (
    <div className="min-h-screen bg-elvion-dark p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">Financial Dashboard</h1>
        <p className="text-elvion-gray">Advanced financial intelligence and analytics</p>
      </div>

      {/* Top Controls */}
      <div className="bg-elvion-card border border-white/10 rounded-lg p-4 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Date Range Picker */}
          <div className="flex gap-2">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-elvion-gray" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="bg-elvion-dark border border-white/10 text-white px-3 py-2 rounded text-sm"
              />
            </div>
            <span className="text-elvion-gray">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="bg-elvion-dark border border-white/10 text-white px-3 py-2 rounded text-sm"
            />
          </div>

          {/* Currency Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setCurrency("USD")}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currency === "USD"
                  ? "bg-elvion-primary text-black"
                  : "bg-elvion-dark border border-white/10 text-white hover:bg-white/5"
              }`}
            >
              USD
            </button>
            <button
              onClick={() => setCurrency("PKR")}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                currency === "PKR"
                  ? "bg-elvion-primary text-black"
                  : "bg-elvion-dark border border-white/10 text-white hover:bg-white/5"
              }`}
            >
              PKR
            </button>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchMetrics}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded font-medium hover:bg-elvion-accent transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Main KPI Cards */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Revenue */}
          <div className="bg-elvion-card border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-elvion-gray text-sm">Total Revenue</p>
              <TrendingUp size={16} className="text-elvion-primary" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.revenue.total)}</p>
            <p className={`text-xs mt-1 ${metrics.revenue.growthPercent >= 0 ? "text-green-400" : "text-red-400"}`}>
              {metrics.revenue.growthPercent >= 0 ? <ArrowUpRight className="inline" size={12} /> : <ArrowDownRight className="inline" size={12} />}
              {" "}{formatPercent(metrics.revenue.growthPercent)} from previous period
            </p>
          </div>

          {/* Net Profit */}
          <div className="bg-elvion-card border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-elvion-gray text-sm">Net Profit</p>
              <DollarSign size={16} className={metrics.profit.netProfit >= 0 ? "text-green-400" : "text-red-400"} />
            </div>
            <p className={`text-2xl font-bold ${metrics.profit.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatCurrency(metrics.profit.netProfit)}
            </p>
            <p className="text-xs mt-1 text-elvion-gray">Margin: {metrics.profit.profitMargin.toFixed(1)}%</p>
          </div>

          {/* Cash on Hand */}
          <div className="bg-elvion-card border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-elvion-gray text-sm">Cash on Hand</p>
              <DollarSign size={16} className="text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.liquidity.cashOnHand)}</p>
            <p className="text-xs mt-1 text-elvion-gray">A/R: {formatCurrency(metrics.liquidity.accountsReceivable)}</p>
          </div>

          {/* Health Score */}
          <div className="bg-elvion-card border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-elvion-gray text-sm">Financial Health</p>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-black ${
                metrics.health.healthScoreColor === "green" ? "bg-green-400" : 
                metrics.health.healthScoreColor === "yellow" ? "bg-yellow-400" : 
                "bg-red-400"
              }`}>
                {metrics.health.healthScore}
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{metrics.health.healthScore > 75 ? "Excellent" : metrics.health.healthScore > 50 ? "Good" : "At Risk"}</p>
            <p className="text-xs mt-1 text-elvion-gray">Runway: {metrics.health.runway > 100 ? "∞" : metrics.health.runway.toFixed(1)} months</p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-elvion-card border border-white/10 rounded-lg overflow-hidden mb-6">
        <div className="flex flex-wrap border-b border-white/10">
          {[
            { id: "overview", label: "Overview" },
            { id: "cashflow", label: "Cash & Burn" },
            { id: "plrevenue", label: "P&L & Revenue" },
            { id: "expensesbudget", label: "Expenses & Budget" },
            { id: "billing", label: "Clients & Projects" },
            { id: "payroll", label: "Team & Payroll" },
            { id: "tax", label: "Tax & Compliance" },
            { id: "forecasting", label: "Forecasting" },
            { id: "reports", label: "Reports" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-elvion-primary border-elvion-primary"
                  : "text-elvion-gray border-transparent hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-elvion-card border border-white/10 rounded-lg p-6 min-h-96">
        {activeTab === "overview" && metrics && (
          <>
            {/* Module 1 & 13 - Overview & Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "MRR", value: "$15,000", color: "text-green-400" },
                    { label: "Burn Rate", value: "$16,000", color: "text-red-400" },
                    { label: "Profit Margin", value: `${metrics.profit.profitMargin.toFixed(1)}%`, color: "text-blue-400" },
                    { label: "Runway", value: `${metrics.health.runway.toFixed(1)}mo`, color: metrics.health.runwayHealthColor === "green" ? "text-green-400" : "text-yellow-400" },
                  ].map((item) => (
                    <div key={item.label} className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                      <p className="text-elvion-gray text-xs">{item.label}</p>
                      <p className={`text-lg font-bold ${item.color} mt-1`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Financial Health</h3>
                <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke={metrics.health.healthScoreColor === "green" ? "#00D28D" : metrics.health.healthScoreColor === "yellow" ? "#FBBF24" : "#EF4444"}
                          strokeWidth="6"
                          strokeDasharray={`${(metrics.health.healthScore / 100) * 251} 251`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">{metrics.health.healthScore}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{metrics.health.healthScore > 75 ? "Excellent" : metrics.health.healthScore > 50 ? "Good" : "At Risk"}</p>
                      <p className="text-elvion-gray text-sm">Financial Health Score</p>
                      <p className="text-xs text-yellow-400 mt-2">⚠ 3 active alerts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {activeTab === "cashflow" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Cashflow & Burn Rate</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-elvion-gray text-sm mb-3">Monthly Inflow vs Outflow</p>
                <div className="space-y-2">
                  {[
                    { month: "Jan", in: 20, out: 16 },
                    { month: "Feb", in: 22, out: 16.5 },
                    { month: "Mar", in: 19, out: 16 },
                    { month: "Apr", in: 23, out: 17 },
                  ].map((item) => (
                    <div key={item.month} className="flex items-center gap-2">
                      <span className="w-10 text-sm text-white">{item.month}</span>
                      <div className="flex-1 flex gap-1">
                        <div className="flex-1 h-4 bg-green-400 rounded" style={{ width: `${(item.in / 25) * 100}%` }}></div>
                        <div className="flex-1 h-4 bg-red-400 rounded" style={{ width: `${(item.out / 25) * 100}%` }}></div>
                      </div>
                      <span className="text-xs text-white w-12">${item.in}k</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-elvion-gray text-sm mb-3">Burn Rate Analysis</p>
                <div className="space-y-4">
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
                    <p className="text-elvion-gray text-xs">Current Monthly Burn</p>
                    <p className="text-3xl font-bold text-red-400">$16,000</p>
                  </div>
                  <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
                    <p className="text-elvion-gray text-xs">Runway Remaining</p>
                    <p className="text-3xl font-bold text-yellow-400">8.5 months</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "plrevenue" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">P&L & Revenue Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white font-semibold">Revenue</span>
                  <span className="text-white font-semibold">$23,000</span>
                </div>
                <div className="flex justify-between py-2 text-elvion-gray ml-4">
                  <span>Projects</span>
                  <span>$20,000</span>
                </div>
                <div className="flex justify-between py-2 text-elvion-gray ml-4">
                  <span>Retainers</span>
                  <span>$3,000</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white font-semibold">COGS</span>
                  <span className="text-white font-semibold">$4,600</span>
                </div>
                <div className="flex justify-between py-2 bg-green-400/10 px-2 rounded">
                  <span className="text-green-300 font-semibold">Gross Profit</span>
                  <span className="text-green-300 font-semibold">$18,400 (80%)</span>
                </div>
                <div className="flex justify-between py-2 border-t border-white/10">
                  <span className="text-white font-semibold">Expenses</span>
                  <span className="text-white font-semibold">$16,000</span>
                </div>
                <div className="flex justify-between py-3 bg-green-400/20 px-3 rounded-lg">
                  <span className="text-green-200 font-bold">NET PROFIT</span>
                  <span className="text-green-200 font-bold">$2,400 (10%)</span>
                </div>
              </div>
              <div>
                <p className="text-elvion-gray text-sm mb-3">Revenue by Type</p>
                <div className="space-y-2">
                  {[
                    { type: "Retainers", pct: 65 },
                    { type: "Projects", pct: 22 },
                    { type: "Consulting", pct: 11 },
                    { type: "Other", pct: 2 },
                  ].map((item) => (
                    <div key={item.type} className="flex items-center gap-2">
                      <span className="text-sm text-white w-16">{item.type}</span>
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-elvion-primary" style={{ width: `${item.pct}%` }}></div>
                      </div>
                      <span className="text-xs text-white w-8 text-right">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "expensesbudget" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Expenses & Budget</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <p className="text-elvion-gray text-sm mb-3">Expense Breakdown</p>
                <div className="space-y-2">
                  {[
                    { cat: "Payroll", amt: 8000, pct: 50 },
                    { cat: "Marketing", amt: 3000, pct: 18.75 },
                    { cat: "Software", amt: 2000, pct: 12.5 },
                    { cat: "Office", amt: 2000, pct: 12.5 },
                    { cat: "Other", amt: 800, pct: 6.25 },
                  ].map((item) => (
                    <div key={item.cat} className="flex items-center justify-between text-sm">
                      <span className="text-white">{item.cat}</span>
                      <div className="flex-1 mx-3 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-elvion-primary" style={{ width: `${item.pct}%` }}></div>
                      </div>
                      <span className="text-white font-semibold w-16 text-right">${item.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-elvion-gray text-sm mb-3">Budget vs Actual</p>
                <div className="space-y-3">
                  {[
                    { cat: "Payroll", budget: 24000, actual: 23800, color: "green" },
                    { cat: "Marketing", budget: 9000, actual: 9400, color: "yellow" },
                    { cat: "Software", budget: 6000, actual: 5850, color: "green" },
                  ].map((item) => (
                    <div key={item.cat} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white">{item.cat}</span>
                        <span className={`text-xs font-semibold ${item.color === "green" ? "text-green-400" : "text-yellow-400"}`}>
                          {((item.actual / item.budget) * 100 - 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex gap-1 h-2">
                        <div className="flex-1 bg-blue-400 rounded opacity-50"></div>
                        <div className={`flex-1 ${item.color === "green" ? "bg-green-400" : "bg-yellow-400"} rounded`} style={{ width: `${(item.actual / item.budget) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "billing" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Billing & Clients</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { label: "Paid", val: 12, color: "green" },
                { label: "Pending", val: 3, color: "yellow" },
                { label: "Overdue", val: 1, color: "red" },
                { label: "Draft", val: 2, color: "blue" },
              ].map((item) => (
                <div key={item.label} className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                  <p className="text-elvion-gray text-xs">{item.label}</p>
                  <p className={`text-2xl font-bold ${item.color === "green" ? "text-green-400" : item.color === "yellow" ? "text-yellow-400" : item.color === "red" ? "text-red-400" : "text-blue-400"}`}>{item.val}</p>
                </div>
              ))}
            </div>
            <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-white font-semibold mb-3">Top Clients</p>
              <div className="space-y-2">
                {[
                  { client: "Tech Startup Inc", revenue: 8000, pct: 35, status: "⚠" },
                  { client: "E-commerce Co", revenue: 4000, pct: 17, status: "✓" },
                  { client: "SaaS Platform", revenue: 3500, pct: 15, status: "✓" },
                ].map((item) => (
                  <div key={item.client} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={item.status === "⚠" ? "text-yellow-400" : "text-green-400"}>{item.status}</span>
                      <span className="text-white">{item.client}</span>
                    </div>
                    <span className="text-white font-semibold">${item.revenue}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "payroll" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Team & Payroll</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                <p className="text-elvion-gray text-xs">Monthly Payroll</p>
                <p className="text-2xl font-bold text-white">$8,000</p>
              </div>
              <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                <p className="text-elvion-gray text-xs">% of Revenue</p>
                <p className="text-2xl font-bold text-blue-400">34.8%</p>
              </div>
              <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                <p className="text-elvion-gray text-xs">Team Size</p>
                <p className="text-2xl font-bold text-white">5 FT + 2 CT</p>
              </div>
            </div>
            <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
              <p className="text-sm text-white font-semibold mb-3">Team Members</p>
              <div className="space-y-2 text-xs">
                {[
                  { name: "John Doe", role: "CEO", salary: 3000 },
                  { name: "Jane Smith", role: "Designer", salary: 2000 },
                  { name: "Mike Johnson", role: "Developer", salary: 2500 },
                  { name: "Sarah Lee", role: "Manager", salary: 1500 },
                ].map((item) => (
                  <div key={item.name} className="flex justify-between text-white">
                    <span>{item.name} • {item.role}</span>
                    <span className="font-semibold">${item.salary}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === "tax" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Tax & Compliance</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                <p className="text-elvion-gray text-xs">Est. Tax Liability</p>
                <p className="text-2xl font-bold text-white">$8,500</p>
              </div>
              <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                <p className="text-elvion-gray text-xs">Set Aside</p>
                <p className="text-2xl font-bold text-blue-400">$6,375</p>
              </div>
              <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                <p className="text-elvion-gray text-xs">Gap</p>
                <p className="text-2xl font-bold text-yellow-400">$2,125</p>
              </div>
            </div>
            <p className="text-sm text-white font-semibold mb-2">Q1 2026 Status: Pending • Due Apr 15</p>
          </div>
        )}
        
        {activeTab === "forecasting" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Financial Forecasting</h3>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { scenario: "Conservative", revenue: 68, color: "blue" },
                { scenario: "Baseline", revenue: 75, color: "green" },
                { scenario: "Optimistic", revenue: 85, color: "purple" },
              ].map((item) => (
                <div key={item.scenario} className="bg-elvion-dark/50 border border-white/10 rounded-lg p-3">
                  <p className={`text-sm font-semibold ${item.color === "blue" ? "text-blue-400" : item.color === "green" ? "text-green-400" : "text-purple-400"}`}>{item.scenario}</p>
                  <p className="text-2xl font-bold text-white mt-1">${item.revenue}k</p>
                  <p className="text-xs text-elvion-gray">Q2 Revenue</p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === "reports" && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Reports & Export</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { name: "P&L Statement", icon: "📊" },
                { name: "Cashflow Report", icon: "💰" },
                { name: "Expense Report", icon: "💸" },
                { name: "AR Aging", icon: "📋" },
                { name: "Tax Summary", icon: "🏛️" },
                { name: "Transactions", icon: "📈" },
              ].map((item) => (
                <button key={item.name} className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors text-left">
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <p className="text-sm text-white font-semibold">{item.name}</p>
                  <p className="text-xs text-elvion-gray mt-1">Download PDF</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
