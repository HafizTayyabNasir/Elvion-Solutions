// components/FinancialModules.tsx
"use client";

import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  AlertCircle,
  Zap,
  PieChart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
} from "lucide-react";

interface FinancialMetrics {
  revenue: { total: number; growthPercent: number; last12Months: number[] };
  expenses: { total: number; monthlyBurnRate: number };
  profit: { netProfit: number; profitMargin: number };
  liquidity: { cashOnHand: number; accountsReceivable: number; accountsPayable: number };
  health: { runway: number; runwayHealthColor: string; healthScore: number; healthScoreColor: string };
}

interface ModuleProps {
  metrics: FinancialMetrics;
  currency: "USD" | "PKR";
  formatCurrency: (cents: number) => string;
  formatPercent: (num: number) => string;
}

// Module 1: Executive Overview
export function Module1Overview({ metrics, formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Executive Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-elvion-gray text-xs">Monthly Recurring Revenue</p>
              <p className="text-2xl font-bold text-white mt-2">$15,000</p>
            </div>
            <TrendingUp className="text-elvion-primary" size={20} />
          </div>
          <p className="text-xs text-green-400 flex items-center"><ArrowUpRight size={12} className="mr-1" /> 12% increase</p>
        </div>

        {/* Expenses Card */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-elvion-gray text-xs">Total Monthly Expenses</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(metrics.expenses.total)}</p>
            </div>
            <DollarSign className="text-red-400" size={20} />
          </div>
          <p className="text-xs text-red-400 flex items-center"><ArrowUpRight size={12} className="mr-1" /> 5% increase</p>
        </div>

        {/* Profit Margin */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-elvion-gray text-xs">Profit Margin</p>
              <p className="text-2xl font-bold text-white mt-2">{metrics.profit.profitMargin.toFixed(1)}%</p>
            </div>
            <PieChart className="text-blue-400" size={20} />
          </div>
          <p className="text-xs text-elvion-gray">Healthy range: 20-30%</p>
        </div>

        {/* A/R Aging */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-elvion-gray text-xs">Accounts Receivable</p>
              <p className="text-2xl font-bold text-white mt-2">{formatCurrency(metrics.liquidity.accountsReceivable)}</p>
            </div>
            <AlertCircle className="text-yellow-400" size={20} />
          </div>
          <p className="text-xs text-yellow-400">3 invoices pending</p>
        </div>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4 mt-6">
        <h4 className="text-sm font-semibold text-white mb-4">Expense Breakdown</h4>
        <div className="space-y-3">
          {[
            { category: "Payroll", amount: 8000, percent: 50, color: "bg-blue-400" },
            { category: "Software", amount: 2000, percent: 12.5, color: "bg-green-400" },
            { category: "Marketing", amount: 3000, percent: 18.75, color: "bg-purple-400" },
            { category: "Office", amount: 2000, percent: 12.5, color: "bg-yellow-400" },
            { category: "Other", amount: 800, percent: 6.25, color: "bg-red-400" },
          ].map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-sm text-elvion-gray">{item.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                </div>
                <span className="text-sm text-white font-semibold w-12 text-right">${item.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Module 13: Health Score & Alerts
export function Module13Health({ metrics }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Financial Health & Alerts</h3>

      {/* Health Score Gauge */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-elvion-gray text-sm mb-2">Overall Financial Health Score</p>
            <p className="text-4xl font-bold text-white">{metrics.health.healthScore}</p>
            <p className="text-sm text-elvion-gray mt-1">
              {metrics.health.healthScore > 75 ? "Excellent condition" : metrics.health.healthScore > 50 ? "Good condition" : "Needs attention"}
            </p>
          </div>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke={metrics.health.healthScoreColor === "green" ? "#00D28D" : metrics.health.healthScoreColor === "yellow" ? "#FBBF24" : "#EF4444"}
                strokeWidth="8"
                strokeDasharray={`${(metrics.health.healthScore / 100) * 283} 283`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{metrics.health.healthScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <AlertCircle size={16} className="text-yellow-400" />
          Active Alerts
        </h4>
        <div className="space-y-3">
          {[
            { type: "warning", message: "Runway is 8 months. Consider revenue growth initiatives.", severity: "warning" },
            { type: "info", message: "Revenue concentrated: Top client is 35% of revenue.", severity: "info" },
            { type: "info", message: "Burn rate increased 5% month-over-month.", severity: "info" },
          ].map((alert, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex justify-between items-start ${
                alert.severity === "warning"
                  ? "bg-yellow-400/10 border-yellow-400/30"
                  : "bg-blue-400/10 border-blue-400/30"
              }`}
            >
              <p className={`text-sm ${alert.severity === "warning" ? "text-yellow-300" : "text-blue-300"}`}>
                {alert.message}
              </p>
              <button className="text-white/50 hover:text-white">
                <MoreVertical size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Health Factors Breakdown */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Health Score Components</h4>
        <div className="space-y-2">
          {[
            { factor: "Runway Length", score: 20, weight: 25 },
            { factor: "Profit Margin", score: 18, weight: 20 },
            { factor: "Revenue Growth", score: 15, weight: 20 },
            { factor: "Collection Efficiency", score: 14, weight: 15 },
            { factor: "Expense Control", score: 10, weight: 10 },
            { factor: "Revenue Concentration", score: 8, weight: 10 },
          ].map((item) => (
            <div key={item.factor} className="flex items-center justify-between text-sm">
              <span className="text-elvion-gray">{item.factor}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-elvion-primary" style={{ width: `${item.score}%` }}></div>
                </div>
                <span className="text-white w-8 text-right">{item.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Module 2: Cashflow
export function Module2Cashflow({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Cashflow Analysis</h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Inflows vs Outflows */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-4">Monthly Cashflow</h4>
          <div className="space-y-4">
            {[
              { month: "Jan", inflow: 20000, outflow: 16000 },
              { month: "Feb", inflow: 22000, outflow: 16500 },
              { month: "Mar", inflow: 19000, outflow: 16000 },
              { month: "Apr", inflow: 23000, outflow: 17000 },
            ].map((item) => (
              <div key={item.month} className="space-y-1">
                <p className="text-xs text-elvion-gray">{item.month}</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <div className="h-2 bg-green-400 rounded-full" style={{ width: "100%" }}></div>
                    <p className="text-xs text-green-400 mt-1">${item.inflow}</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-red-400 rounded-full" style={{ width: "85%" }}></div>
                    <p className="text-xs text-red-400 mt-1">${item.outflow}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 90-Day Projection */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-4">90-Day Projection</h4>
          <div className="space-y-3">
            {[
              { month: "May 2026", balance: 25000, trend: "up" },
              { month: "Jun 2026", balance: 28000, trend: "up" },
              { month: "Jul 2026", balance: 31000, trend: "up" },
            ].map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white">{item.month}</p>
                  <p className="text-xs text-elvion-gray">Projected balance</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-green-400">${item.balance}k</p>
                  <TrendingUp className="text-green-400 ml-auto" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Weekly Breakdown (Current Month)</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-elvion-gray">Week</th>
                <th className="text-right py-2 text-elvion-gray">Inflow</th>
                <th className="text-right py-2 text-elvion-gray">Outflow</th>
                <th className="text-right py-2 text-elvion-gray">Net</th>
              </tr>
            </thead>
            <tbody>
              {[
                { week: "Week 1", inflow: 5000, outflow: 4000 },
                { week: "Week 2", inflow: 6000, outflow: 4200 },
                { week: "Week 3", inflow: 5500, outflow: 4100 },
                { week: "Week 4", inflow: 6500, outflow: 4700 },
              ].map((item) => (
                <tr key={item.week} className="border-b border-white/10">
                  <td className="py-2 text-white">{item.week}</td>
                  <td className="text-right text-green-400">${item.inflow}</td>
                  <td className="text-right text-red-400">${item.outflow}</td>
                  <td className={`text-right font-semibold ${item.inflow - item.outflow > 0 ? "text-green-400" : "text-red-400"}`}>
                    ${item.inflow - item.outflow}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Module 6: Expenses
export function Module6Expenses({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Expense Management</h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Expense by Category */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-4">By Category</h4>
          <div className="space-y-2">
            {[
              { cat: "Payroll", amt: 8000, pct: 50 },
              { cat: "Software", amt: 2000, pct: 12.5 },
              { cat: "Marketing", amt: 3000, pct: 18.75 },
              { cat: "Office", amt: 2000, pct: 12.5 },
              { cat: "Other", amt: 800, pct: 6.25 },
            ].map((item) => (
              <div key={item.cat} className="text-xs">
                <div className="flex justify-between mb-1">
                  <span className="text-elvion-gray">{item.cat}</span>
                  <span className="text-white">${item.amt}</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-elvion-primary" style={{ width: `${item.pct}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-4">Top Vendors</h4>
          <div className="space-y-3">
            {[
              { vendor: "Salary Payments", amount: 8000 },
              { vendor: "Adobe Suite", amount: 250 },
              { vendor: "Google Ads", amount: 2000 },
              { vendor: "Office Rent", amount: 1800 },
            ].map((item) => (
              <div key={item.vendor} className="flex justify-between items-center text-sm">
                <span className="text-elvion-gray">{item.vendor}</span>
                <span className="text-white font-semibold">${item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recurring vs One-time */}
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-4">Expense Type</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-elvion-gray">Recurring</span>
                <span className="text-white font-semibold">$12,000 (75%)</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400" style={{ width: "75%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-elvion-gray">One-time</span>
                <span className="text-white font-semibold">$4,000 (25%)</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-hidden overflow-hidden">
                <div className="h-full bg-purple-400" style={{ width: "25%" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Recent Expenses</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-elvion-gray">Date</th>
                <th className="text-left py-2 text-elvion-gray">Vendor</th>
                <th className="text-left py-2 text-elvion-gray">Category</th>
                <th className="text-right py-2 text-elvion-gray">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: "2026-04-20", vendor: "Adobe", cat: "Software", amt: 250 },
                { date: "2026-04-19", vendor: "Google Ads", cat: "Marketing", amt: 2000 },
                { date: "2026-04-15", vendor: "Salary", cat: "Payroll", amt: 8000 },
              ].map((item) => (
                <tr key={`${item.date}-${item.vendor}`} className="border-b border-white/10">
                  <td className="py-2 text-white">{item.date}</td>
                  <td className="py-2 text-white">{item.vendor}</td>
                  <td className="py-2 text-elvion-gray">{item.cat}</td>
                  <td className="text-right py-2 text-white font-semibold">${item.amt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Module 4: P&L Statement
export function Module4PL({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Profit & Loss Statement</h3>

      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-6">
        <div className="space-y-4 text-sm">
          <div className="flex justify-between pb-2 border-b border-white/10">
            <span className="text-white font-semibold">REVENUE</span>
            <span className="text-white font-semibold">$23,000</span>
          </div>

          <div className="pl-4 space-y-2">
            <div className="flex justify-between text-elvion-gray">
              <span>Client Projects</span>
              <span>$20,000</span>
            </div>
            <div className="flex justify-between text-elvion-gray">
              <span>Retainer Services</span>
              <span>$3,000</span>
            </div>
          </div>

          <div className="flex justify-between py-2 border-y border-white/10">
            <span className="text-white font-semibold">Cost of Services (COGS)</span>
            <span className="text-white font-semibold">$4,600</span>
          </div>

          <div className="flex justify-between py-2 bg-green-400/10 px-2 rounded">
            <span className="text-green-300 font-semibold">Gross Profit</span>
            <span className="text-green-300 font-semibold">$18,400 (80%)</span>
          </div>

          <div className="flex justify-between py-2 border-t border-white/10">
            <span className="text-white font-semibold">OPERATING EXPENSES</span>
            <span className="text-white font-semibold">$16,000</span>
          </div>

          <div className="pl-4 space-y-2">
            <div className="flex justify-between text-elvion-gray text-xs">
              <span>Payroll</span>
              <span>$8,000</span>
            </div>
            <div className="flex justify-between text-elvion-gray text-xs">
              <span>Software & Tools</span>
              <span>$2,000</span>
            </div>
            <div className="flex justify-between text-elvion-gray text-xs">
              <span>Marketing</span>
              <span>$3,000</span>
            </div>
            <div className="flex justify-between text-elvion-gray text-xs">
              <span>Office & Utilities</span>
              <span>$2,000</span>
            </div>
            <div className="flex justify-between text-elvion-gray text-xs">
              <span>Other</span>
              <span>$1,000</span>
            </div>
          </div>

          <div className="flex justify-between py-2 bg-blue-400/10 px-2 rounded">
            <span className="text-blue-300 font-semibold">EBITDA</span>
            <span className="text-blue-300 font-semibold">$2,400</span>
          </div>

          <div className="flex justify-between py-3 bg-green-400/20 px-3 rounded-lg border border-green-400/30">
            <span className="text-green-200 font-bold">NET PROFIT</span>
            <span className="text-green-200 font-bold">$2,400 (10.4%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Module 7: Invoicing
export function Module7Invoicing({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Client Billing & Invoicing</h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Paid Invoices", value: 12, total: "$28,500", color: "text-green-400" },
          { label: "Pending", value: 3, total: "$7,200", color: "text-yellow-400" },
          { label: "Overdue", value: 1, total: "$2,000", color: "text-red-400" },
          { label: "Draft", value: 2, total: "$5,500", color: "text-blue-400" },
        ].map((item) => (
          <div key={item.label} className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
            <p className="text-elvion-gray text-xs mb-2">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color} mb-1`}>{item.value}</p>
            <p className="text-sm text-white">{item.total}</p>
          </div>
        ))}
      </div>

      {/* Aging Report */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Accounts Receivable Aging</h4>
        <div className="space-y-3">
          {[
            { range: "0-30 days", count: 8, amount: 15000 },
            { range: "31-60 days", count: 3, amount: 7200 },
            { range: "61-90 days", count: 1, amount: 2000 },
            { range: "90+ days", count: 0, amount: 0 },
          ].map((item) => (
            <div key={item.range} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-white mb-1">{item.range}</p>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.range === "0-30 days" ? "bg-green-400" : item.range === "31-60 days" ? "bg-yellow-400" : "bg-red-400"}`}
                    style={{ width: `${(item.amount / 24200) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-sm text-white font-semibold">${item.amount}</p>
                <p className="text-xs text-elvion-gray">{item.count} invoices</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Days Sales Outstanding</h4>
          <p className="text-3xl font-bold text-blue-400">22 days</p>
          <p className="text-xs text-elvion-gray mt-1">Average: Industry avg 30 days</p>
        </div>
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-white mb-3">Collection Efficiency</h4>
          <p className="text-3xl font-bold text-green-400">92%</p>
          <p className="text-xs text-elvion-gray mt-1">Invoices paid on time</p>
        </div>
      </div>
    </div>
  );
}
