// components/FinancialModules2.tsx
"use client";

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

interface ModuleProps {
  formatCurrency?: (cents: number) => string;
}

// Module 3: Burn Rate & Runway
export function Module3BurnRate({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Burn Rate & Runway Analysis</h3>

      {/* Burn Rate Hero */}
      <div className="bg-gradient-to-r from-red-400/10 to-red-400/5 border border-red-400/30 rounded-lg p-6">
        <p className="text-elvion-gray text-sm mb-2">Current Monthly Burn Rate</p>
        <p className="text-5xl font-bold text-white">$16,000</p>
        <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
          <TrendingUp size={14} /> 5% increase from last month
        </p>
      </div>

      {/* Runway Gauge */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-elvion-gray text-sm">Runway Remaining</p>
            <p className="text-4xl font-bold text-green-400">8.5 months</p>
            <p className="text-sm text-elvion-gray mt-2">Based on current burn rate</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-yellow-400 font-semibold">⚠ Action Needed</p>
            <p className="text-xs text-elvion-gray mt-2">Below 12-month target</p>
          </div>
        </div>

        {/* Runway Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-elvion-gray mb-2">
            <span>{'Healthy (>12mo)'}</span>
            <span>Warning (6-12mo)</span>
            <span>{'Critical (<6mo)'}</span>
          </div>
          <div className="h-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full overflow-hidden relative">
            <div className="absolute h-full w-1 bg-white left-[70%]"></div>
          </div>
          <p className="text-xs text-center text-elvion-gray">Current: 8.5 months</p>
        </div>
      </div>

      {/* Burn Rate Trend */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Burn Rate Trend (6 Months)</h4>
        <div className="space-y-2">
          {[
            { month: "Nov", rate: 14000, trend: "stable" },
            { month: "Dec", rate: 15000, trend: "up" },
            { month: "Jan", rate: 15200, trend: "up" },
            { month: "Feb", rate: 15500, trend: "up" },
            { month: "Mar", rate: 15800, trend: "up" },
            { month: "Apr", rate: 16000, trend: "up" },
          ].map((item) => (
            <div key={item.month} className="flex items-center justify-between">
              <span className="text-elvion-gray text-sm">{item.month}</span>
              <div className="flex-1 mx-4">
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400" style={{ width: `${(item.rate / 16500) * 100}%` }}></div>
                </div>
              </div>
              <span className="text-white text-sm font-semibold w-16 text-right">${item.rate / 1000}k</span>
            </div>
          ))}
        </div>
      </div>

      {/* Break-even Calculator */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Break-even Analysis</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-elvion-gray text-xs mb-1">Monthly Operating Costs</p>
            <p className="text-2xl font-bold text-white">$16,000</p>
          </div>
          <div>
            <p className="text-elvion-gray text-xs mb-1">Required Monthly Revenue</p>
            <p className="text-2xl font-bold text-blue-400">$20,000</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-white mb-2">Current Revenue: $23,000</p>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-400" style={{ width: "115%" }}></div>
          </div>
          <p className="text-xs text-green-400 mt-2">✓ 15% above break-even</p>
        </div>
      </div>
    </div>
  );
}

// Module 5: Revenue Intelligence
export function Module5Revenue({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Revenue Intelligence</h3>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Total Revenue (MTD)</p>
          <p className="text-3xl font-bold text-green-400">$23,000</p>
          <p className="text-sm text-green-400 mt-2 flex items-center gap-1">
            <TrendingUp size={14} /> 12% vs last month
          </p>
        </div>
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Monthly Recurring Revenue</p>
          <p className="text-3xl font-bold text-blue-400">$15,000</p>
          <p className="text-sm text-blue-400 mt-2">65% of total</p>
        </div>
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Annual Run Rate</p>
          <p className="text-3xl font-bold text-purple-400">$276,000</p>
          <p className="text-sm text-purple-400 mt-2">Projected annualized</p>
        </div>
      </div>

      {/* Revenue by Source */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Revenue by Source</h4>
        <div className="space-y-3">
          {[
            { source: "Retainer Clients", revenue: 15000, pct: 65 },
            { source: "Project Work", revenue: 5000, pct: 22 },
            { source: "Consulting", revenue: 2500, pct: 11 },
            { source: "Other Services", revenue: 500, pct: 2 },
          ].map((item) => (
            <div key={item.source} className="flex items-center justify-between">
              <span className="text-sm text-elvion-gray">{item.source}</span>
              <div className="flex items-center gap-2 flex-1 mx-4">
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-elvion-primary" style={{ width: `${item.pct}%` }}></div>
                </div>
                <span className="text-white font-semibold w-12 text-right text-sm">{item.pct}%</span>
              </div>
              <span className="text-white font-semibold w-20 text-right text-sm">${item.revenue}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clients */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Top 5 Revenue Clients</h4>
        <div className="space-y-3">
          {[
            { client: "Tech Startup Inc", revenue: 8000, pct: 35, risk: "⚠" },
            { client: "E-commerce Co", revenue: 4000, pct: 17, risk: "✓" },
            { client: "SaaS Platform", revenue: 3500, pct: 15, risk: "✓" },
            { client: "Digital Agency", revenue: 3000, pct: 13, risk: "✓" },
            { client: "Consulting Firm", revenue: 2500, pct: 11, risk: "✓" },
          ].map((item) => (
            <div key={item.client} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className={`text-lg ${item.risk === "⚠" ? "text-yellow-400" : "text-green-400"}`}>{item.risk}</span>
                <span className="text-white">{item.client}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-elvion-primary" style={{ width: `${item.pct}%` }}></div>
                </div>
                <span className="text-white font-semibold w-16 text-right">${item.revenue}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-yellow-400 font-semibold">⚠ Concentration Risk: Top client is 35% of revenue</p>
        </div>
      </div>

      {/* 12-Month Trend & Forecast */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">12-Month Revenue Trend & Forecast</h4>
        <div className="flex justify-between items-end h-32 gap-1">
          {[
            { month: "May", revenue: 20, forecast: false },
            { month: "Jun", revenue: 19, forecast: false },
            { month: "Jul", revenue: 21, forecast: false },
            { month: "Aug", revenue: 22, forecast: false },
            { month: "Sep", revenue: 21, forecast: false },
            { month: "Oct", revenue: 23, forecast: false },
            { month: "Nov", revenue: 22, forecast: false },
            { month: "Dec", revenue: 24, forecast: false },
            { month: "Jan", revenue: 23, forecast: false },
            { month: "Feb", revenue: 25, forecast: false },
            { month: "Mar", revenue: 23, forecast: false },
            { month: "Apr", revenue: 24, forecast: false },
            { month: "May*", revenue: 25, forecast: true },
            { month: "Jun*", revenue: 26, forecast: true },
            { month: "Jul*", revenue: 27, forecast: true },
          ].map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full ${item.forecast ? "bg-elvion-primary/50 opacity-75" : "bg-elvion-primary"} rounded-t`}
                style={{ height: `${(item.revenue / 30) * 100}%` }}
              ></div>
              <p className="text-xs text-elvion-gray mt-1">{item.month}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Module 8: Budget vs Actual
export function Module8Budget({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Budget vs Actual Tracker</h3>

      {/* Budget Variance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { cat: "On Track", count: 4, color: "bg-green-400" },
          { cat: "Within 10%", count: 2, color: "bg-yellow-400" },
          { cat: "Over 10%", count: 1, color: "bg-red-400" },
        ].map((item) => (
          <div key={item.cat} className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
            <p className="text-elvion-gray text-xs mb-2">{item.cat}</p>
            <p className="text-3xl font-bold text-white">{item.count}</p>
            <div className={`w-full h-1 ${item.color} rounded-full mt-3`}></div>
          </div>
        ))}
      </div>

      {/* Category Comparison */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Budget vs Actual by Category</h4>
        <div className="space-y-4">
          {[
            { cat: "Payroll", budget: 24000, actual: 23800, variance: -0.8 },
            { cat: "Software", budget: 6000, actual: 5850, variance: -2.5 },
            { cat: "Marketing", budget: 9000, actual: 9400, variance: 4.4 },
            { cat: "Office", budget: 6000, actual: 6100, variance: 1.7 },
            { cat: "Legal", budget: 1500, actual: 1200, variance: -20 },
          ].map((item) => (
            <div key={item.cat} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">{item.cat}</span>
                <span className={`text-sm font-semibold ${item.variance < -5 || item.variance > 10 ? "text-red-400" : item.variance > 5 ? "text-yellow-400" : "text-green-400"}`}>
                  {item.variance > 0 ? "+" : ""}{item.variance.toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs text-elvion-gray">
                    <span>Budget</span>
                    <span>${item.budget}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between text-xs text-elvion-gray">
                    <span>Actual</span>
                    <span>${item.actual}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.variance < -5 || item.variance > 10 ? "bg-red-400" : item.variance > 5 ? "bg-yellow-400" : "bg-green-400"}`}
                      style={{ width: `${(item.actual / item.budget) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* YTD Summary */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Year-to-Date Budget Health</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-elvion-gray text-xs mb-2">Total YTD Budget</p>
            <p className="text-2xl font-bold text-white">$143,500</p>
          </div>
          <div>
            <p className="text-elvion-gray text-xs mb-2">Total YTD Actual</p>
            <p className="text-2xl font-bold text-white">$142,350</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white">Budget Utilization</span>
            <span className="text-green-400 font-semibold">99.2%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-green-400" style={{ width: "99.2%" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Module 9: Payroll
export function Module9Payroll({ formatCurrency }: ModuleProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Payroll & Contractor Tracker</h3>

      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Total Monthly Payroll</p>
          <p className="text-3xl font-bold text-white">$8,000</p>
          <p className="text-sm text-elvion-gray mt-2">5 employees</p>
        </div>
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Payroll as % of Revenue</p>
          <p className="text-3xl font-bold text-blue-400">34.8%</p>
          <p className="text-sm text-blue-400 mt-2">{'Healthy: <40%'}</p>
        </div>
        <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
          <p className="text-elvion-gray text-xs mb-2">Contractors Cost</p>
          <p className="text-3xl font-bold text-purple-400">$1,500</p>
          <p className="text-sm text-purple-400 mt-2">2 active contractors</p>
        </div>
      </div>

      {/* Team List */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Team Members</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-elvion-gray">Name</th>
                <th className="text-left py-2 text-elvion-gray">Role</th>
                <th className="text-left py-2 text-elvion-gray">Type</th>
                <th className="text-right py-2 text-elvion-gray">Monthly</th>
                <th className="text-center py-2 text-elvion-gray">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "John Doe", role: "CEO", type: "FT", salary: 3000, status: "Paid" },
                { name: "Jane Smith", role: "Designer", type: "FT", salary: 2000, status: "Paid" },
                { name: "Mike Johnson", role: "Developer", type: "FT", salary: 2500, status: "Paid" },
                { name: "Sarah Lee", role: "Manager", type: "FT", salary: 1500, status: "Paid" },
                { name: "Alex Brown", role: "Contractor", type: "Freelance", salary: 1500, status: "Pending" },
              ].map((item) => (
                <tr key={item.name} className="border-b border-white/10">
                  <td className="py-2 text-white">{item.name}</td>
                  <td className="py-2 text-elvion-gray">{item.role}</td>
                  <td className="py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.type === "FT" ? "bg-blue-400/20 text-blue-300" : "bg-purple-400/20 text-purple-300"}`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="text-right py-2 text-white font-semibold">${item.salary}</td>
                  <td className="text-center py-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.status === "Paid" ? "bg-green-400/20 text-green-300" : "bg-yellow-400/20 text-yellow-300"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll Trend */}
      <div className="bg-elvion-dark/50 border border-white/10 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-white mb-4">Payroll Trend (Last 6 Months)</h4>
        <div className="flex justify-between items-end h-24 gap-1">
          {[
            { month: "Nov", amount: 7500 },
            { month: "Dec", amount: 8500 },
            { month: "Jan", amount: 8000 },
            { month: "Feb", amount: 8000 },
            { month: "Mar", amount: 8000 },
            { month: "Apr", amount: 8000 },
          ].map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-blue-400 rounded-t" style={{ height: `${(item.amount / 8500) * 100}%` }}></div>
              <p className="text-xs text-elvion-gray mt-2">{item.month}</p>
              <p className="text-xs text-white font-semibold">${item.amount / 1000}k</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
