// components/FinancialModules3.tsx
"use client";

import { TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

interface ModuleProps {
  formatCurrency?: (cents: number) => string;
}

// Module 10: Project Profitability
export function Module10Projects({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Project Profitability</h3>

      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 text-elvion-gray">Project</th>
              <th className="text-right py-2 text-elvion-gray">Revenue</th>
              <th className="text-right py-2 text-elvion-gray">Costs</th>
              <th className="text-right py-2 text-elvion-gray">Profit</th>
              <th className="text-right py-2 text-elvion-gray">Margin</th>
            </tr>
          </thead>
          <tbody>
            {[
              { name: "Tech Startup Website", revenue: 8000, costs: 2000, profit: 6000, margin: 75 },
              { name: "E-commerce Redesign", revenue: 5000, costs: 1500, profit: 3500, margin: 70 },
              { name: "SaaS Optimization", revenue: 6000, costs: 1800, profit: 4200, margin: 70 },
              { name: "Content Strategy", revenue: 3000, costs: 2500, profit: 500, margin: 17 },
              { name: "Ad Management", revenue: 2500, costs: 3000, profit: -500, margin: -20 },
            ].map((item) => (
              <tr key={item.name} className="border-b border-white/10">
                <td className="py-2 text-white">{item.name}</td>
                <td className="text-right text-white font-semibold">${item.revenue}</td>
                <td className="text-right text-white">${item.costs}</td>
                <td className={`text-right font-semibold ${item.profit > 0 ? "text-green-400" : "text-red-400"}`}>
                  ${item.profit}
                </td>
                <td className={`text-right font-semibold ${item.margin > 0 ? "text-green-400" : "text-red-400"}`}>
                  {item.margin}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Profitability Ranking */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Profitability Ranking</h4>
        <div className="space-y-3">
          {[
            { rank: 1, name: "Tech Startup Website", margin: 75, status: "⭐⭐⭐" },
            { rank: 2, name: "E-commerce Redesign", margin: 70, status: "⭐⭐" },
            { rank: 3, name: "SaaS Optimization", margin: 70, status: "⭐⭐" },
            { rank: 4, name: "Content Strategy", margin: 17, status: "⚠" },
            { rank: 5, name: "Ad Management", margin: -20, status: "❌ Loss" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-elvion-gray w-6">#{item.rank}</span>
                <div>
                  <p className="text-sm text-white">{item.name}</p>
                  <p className="text-xs text-elvion-gray">{item.status}</p>
                </div>
              </div>
              <p className={`text-lg font-bold ${item.margin > 0 ? "text-green-400" : "text-red-400"}`}>
                {item.margin}%
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Module 11: Tax & Compliance
export function Module11Tax({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Tax & Compliance Tracker</h3>

      {/* Tax Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Est. Annual Tax Liability</p>
          <p className="text-2xl font-bold text-white">$8,500</p>
          <p className="text-sm text-elvion-gray mt-2">~25% effective rate</p>
        </div>
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Tax Provision Set Aside</p>
          <p className="text-2xl font-bold text-blue-400">$6,375</p>
          <p className="text-sm text-blue-400 mt-2">75% reserved</p>
        </div>
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Remaining Gap</p>
          <p className="text-2xl font-bold text-yellow-400">$2,125</p>
          <p className="text-sm text-yellow-400 mt-2">To be set aside</p>
        </div>
      </div>

      {/* Quarterly Schedule */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Quarterly Tax Payments</h4>
        <div className="space-y-3">
          {[
            { quarter: "Q1 2026", dueDate: "Apr 15", amount: 2000, status: "Pending", daysUntil: 15 },
            { quarter: "Q2 2026", dueDate: "Jul 15", amount: 2000, status: "Upcoming", daysUntil: 86 },
            { quarter: "Q3 2026", dueDate: "Oct 15", amount: 2000, status: "Upcoming", daysUntil: 178 },
            { quarter: "Q4 2026", dueDate: "Jan 15, 2027", amount: 2500, status: "Upcoming", daysUntil: 270 },
          ].map((item) => (
            <div key={item.quarter} className="flex items-center justify-between p-3 bg-white/5 rounded">
              <div>
                <p className="text-sm text-white font-semibold">{item.quarter}</p>
                <p className="text-xs text-elvion-gray">{item.dueDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white font-semibold">${item.amount}</p>
                <p className={`text-xs font-semibold ${item.status === "Pending" ? "text-yellow-400" : "text-elvion-gray"}`}>
                  {item.status} • {item.daysUntil} days
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Checklist */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Annual Compliance Checklist</h4>
        <div className="space-y-2">
          {[
            { task: "Quarterly Tax Payments", status: "In Progress", icon: "⏳" },
            { task: "Annual Tax Return (1040)", status: "Not Started", icon: "⭕" },
            { task: "Business License Renewal", status: "Completed", icon: "✓" },
            { task: "Payroll Tax Filing", status: "Completed", icon: "✓" },
            { task: "Financial Audit", status: "Not Required", icon: "-" },
            { task: "GST/VAT Filing", status: "Completed", icon: "✓" },
          ].map((item) => (
            <div key={item.task} className="flex items-center justify-between p-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.icon}</span>
                <p className="text-sm text-white">{item.task}</p>
              </div>
              <p className={`text-xs font-semibold ${item.status === "Completed" ? "text-green-400" : item.status === "In Progress" ? "text-blue-400" : "text-red-400"}`}>
                {item.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Module 12: Forecasting
export function Module12Forecasting({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Financial Forecasting</h3>

      {/* Forecast Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { scenario: "Conservative", revenue: 68000, expenses: 51000, profit: 17000, color: "blue" },
          { scenario: "Baseline", revenue: 75000, expenses: 50000, profit: 25000, color: "green" },
          { scenario: "Optimistic", revenue: 85000, expenses: 49000, profit: 36000, color: "purple" },
        ].map((item) => (
          <div key={item.scenario} className={`bg-elvion-dark/50 border border-white/10 rounded-lg p-4`}>
            <p className={`text-sm font-semibold mb-4 ${item.color === "blue" ? "text-blue-400" : item.color === "green" ? "text-green-400" : "text-purple-400"}`}>
              {item.scenario} Scenario
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-elvion-gray">Revenue (Q2)</span>
                <span className="text-white font-semibold">${item.revenue}k</span>
              </div>
              <div className="flex justify-between">
                <span className="text-elvion-gray">Expenses</span>
                <span className="text-white font-semibold">${item.expenses}k</span>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                <span className="text-white font-semibold">Net Profit</span>
                <span className={`font-bold ${item.color === "blue" ? "text-blue-400" : item.color === "green" ? "text-green-400" : "text-purple-400"}`}>
                  ${item.profit}k
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 12-Month Forecast */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">12-Month Revenue Forecast</h4>
        <div className="flex justify-between items-end h-32 gap-1">
          {[
            { month: "May", revenue: 24, actual: true },
            { month: "Jun", revenue: 25, actual: true },
            { month: "Jul", revenue: 26, actual: true },
            { month: "Aug", revenue: 27, actual: false },
            { month: "Sep", revenue: 28, actual: false },
            { month: "Oct", revenue: 29, actual: false },
            { month: "Nov", revenue: 30, actual: false },
            { month: "Dec", revenue: 31, actual: false },
            { month: "Jan", revenue: 32, actual: false },
            { month: "Feb", revenue: 33, actual: false },
            { month: "Mar", revenue: 34, actual: false },
            { month: "Apr", revenue: 35, actual: false },
          ].map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t ${item.actual ? "bg-elvion-primary" : "bg-elvion-primary/50 opacity-75"}`}
                style={{ height: `${(item.revenue / 40) * 100}%` }}
              ></div>
              <p className="text-xs text-elvion-gray mt-2">{item.month}</p>
            </div>
          ))}
        </div>
      </div>

      {/* What-If Calculator */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">What-If Analysis</h4>
        <div className="space-y-3">
          {[
            { scenario: "Add 2 new retainer clients at $2k each", impactRevenue: 4000, impactRunway: 1.5, color: "green" },
            { scenario: "Reduce team size by 1 developer", impactRevenue: 0, impactRunway: 2.1, color: "yellow" },
            { scenario: "Increase marketing budget by $1k/mo", impactRevenue: 3000, impactRunway: -1.2, color: "blue" },
            { scenario: "Lose top client (35% of revenue)", impactRevenue: -8000, impactRunway: -3.2, color: "red" },
          ].map((item, idx) => (
            <div key={idx} className={`p-3 border-l-4 rounded bg-white/5 ${item.color === "green" ? "border-green-400" : item.color === "yellow" ? "border-yellow-400" : item.color === "blue" ? "border-blue-400" : "border-red-400"}`}>
              <p className="text-sm text-white mb-1">{item.scenario}</p>
              <div className="flex gap-4 text-xs">
                <span className="text-elvion-gray">
                  Revenue Impact: <span className={item.impactRevenue > 0 ? "text-green-400" : "text-red-400"}>{item.impactRevenue > 0 ? "+" : ""}{item.impactRevenue}k</span>
                </span>
                <span className="text-elvion-gray">
                  Runway Impact: <span className={item.impactRunway > 0 ? "text-green-400" : "text-red-400"}>{item.impactRunway > 0 ? "+" : ""}{item.impactRunway.toFixed(1)} mo</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Module 14: Reports & Export
export function Module14Reports({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Reports & Export Center</h3>

      {/* Quick Exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { name: "P&L Statement", format: "PDF", size: "245 KB", icon: "📊" },
          { name: "Cashflow Report", format: "PDF", size: "189 KB", icon: "💰" },
          { name: "Expense Report", format: "Excel", size: "156 KB", icon: "💸" },
          { name: "AR Aging Report", format: "PDF", size: "102 KB", icon: "📋" },
          { name: "Tax Summary", format: "PDF", size: "178 KB", icon: "🏛️" },
          { name: "Transaction History", format: "CSV", size: "567 KB", icon: "📈" },
        ].map((item) => (
          <div key={item.name} className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-white font-semibold flex items-center gap-2">
                <span>{item.icon}</span>
                {item.name}
              </p>
              <p className="text-xs text-elvion-gray mt-1">{item.format} • {item.size}</p>
            </div>
            <button className="px-3 py-2 bg-elvion-primary text-black rounded text-xs font-semibold hover:bg-elvion-accent transition-colors">
              Download
            </button>
          </div>
        ))}
      </div>

      {/* Scheduled Reports */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Scheduled Reports</h4>
        <div className="space-y-3">
          {[
            { name: "Monthly P&L", frequency: "Monthly", nextDate: "2026-05-01", status: "Active" },
            { name: "Weekly Cashflow", frequency: "Every Monday", nextDate: "2026-04-21", status: "Active" },
            { name: "Quarterly Tax Summary", frequency: "Quarterly", nextDate: "2026-07-01", status: "Active" },
            { name: "Annual Financial Review", frequency: "Yearly", nextDate: "2026-12-31", status: "Pending" },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-white/5 rounded">
              <div>
                <p className="text-sm text-white font-semibold">{item.name}</p>
                <p className="text-xs text-elvion-gray">{item.frequency} • Next: {item.nextDate}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === "Active" ? "bg-green-400/20 text-green-300" : "bg-blue-400/20 text-blue-300"}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Report Builder */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Build Custom Report</h4>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-elvion-gray block mb-1">Report Type</label>
            <select className="w-full bg-elvion-dark border border-white/10 text-white px-3 py-2 rounded text-sm">
              <option>P&L Statement</option>
              <option>Cashflow Report</option>
              <option>Expense Report</option>
              <option>Custom Metrics</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-elvion-gray block mb-1">Start Date</label>
              <input type="date" className="w-full bg-elvion-dark border border-white/10 text-white px-3 py-2 rounded text-sm" />
            </div>
            <div>
              <label className="text-xs text-elvion-gray block mb-1">End Date</label>
              <input type="date" className="w-full bg-elvion-dark border border-white/10 text-white px-3 py-2 rounded text-sm" />
            </div>
          </div>
          <button className="w-full px-4 py-2 bg-elvion-primary text-black rounded font-semibold hover:bg-elvion-accent transition-colors">
            Generate Report
          </button>
        </div>
      </div>

      {/* Audit Trail */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Recent Activity</h4>
        <div className="space-y-2 text-xs">
          {[
            { action: "Expense added", user: "Admin", date: "Apr 20, 14:30", amount: "+$2,000" },
            { action: "Budget updated", user: "Admin", date: "Apr 19, 10:15", amount: "Marketing" },
            { action: "Invoice marked paid", user: "Admin", date: "Apr 18, 09:45", amount: "+$8,000" },
            { action: "Tax provision set", user: "System", date: "Apr 15, 00:00", amount: "$2,125" },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
              <div>
                <p className="text-white">{item.action}</p>
                <p className="text-elvion-gray">{item.user} • {item.date}</p>
              </div>
              <p className="text-white font-semibold">{item.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
