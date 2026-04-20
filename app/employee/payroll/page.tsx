"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
} from "lucide-react";

interface PayrollRecord {
  id: number;
  month: number;
  year: number;
  baseSalary: number;
  bonus: number;
  deductions: number;
  tax: number;
  netPay: number;
  currency: string;
  status: string;
  paidDate: string | null;
  notes: string | null;
}

interface PayrollSummary {
  totalEarnings: number;
  totalDeductions: number;
  monthsProcessed: number;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function EmployeePayrollPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

  const fetchPayroll = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/employee/payroll?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPayrolls(data.payrolls);
        setSummary(data.summary);
      }
    } catch {
      console.error("Failed to fetch payroll");
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-500/20 text-green-400",
      processed: "bg-blue-500/20 text-blue-400",
      draft: "bg-gray-500/20 text-gray-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">My Payroll</h1>
        <p className="text-gray-400 mt-1">View your salary history and payslip details</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-elvion-card rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Earnings ({year})</p>
                <p className="text-2xl font-bold text-white">
                  {payrolls[0]?.currency || "USD"} {summary.totalEarnings.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-elvion-card rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Deductions ({year})</p>
                <p className="text-2xl font-bold text-white">
                  {payrolls[0]?.currency || "USD"} {summary.totalDeductions.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-elvion-card rounded-xl border border-white/10 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Receipt className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Payslips Processed</p>
                <p className="text-2xl font-bold text-white">{summary.monthsProcessed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Year Navigation */}
      <div className="flex items-center justify-center gap-6 bg-elvion-card rounded-xl border border-white/10 p-4">
        <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-semibold text-white">{year}</span>
        <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Payroll Table */}
      <div className="bg-elvion-card rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-elvion-primary"></div>
          </div>
        ) : payrolls.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No payroll records for {year}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Month</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Base Salary</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Bonus</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Deductions</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Tax</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Net Pay</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Paid Date</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payrolls.map((p) => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">
                      {monthNames[p.month - 1]}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {p.currency} {p.baseSalary.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-400">
                      {p.bonus > 0 ? `+${p.currency} ${p.bonus.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-400">
                      {p.deductions > 0 ? `-${p.currency} ${p.deductions.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-400">
                      {p.tax > 0 ? `-${p.currency} ${p.tax.toLocaleString()}` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-elvion-primary">
                      {p.currency} {p.netPay.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {p.paidDate ? new Date(p.paidDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedPayroll(p)}
                        className="text-sm text-elvion-primary hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payslip Detail Modal */}
      {selectedPayroll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-elvion-card rounded-2xl border border-white/10 w-full max-w-md">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                Payslip — {monthNames[selectedPayroll.month - 1]} {selectedPayroll.year}
              </h3>
              <button onClick={() => setSelectedPayroll(null)} className="text-gray-400 hover:text-white">
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Base Salary</span>
                <span className="text-white">{selectedPayroll.currency} {selectedPayroll.baseSalary.toLocaleString()}</span>
              </div>
              {selectedPayroll.bonus > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Bonus</span>
                  <span className="text-green-400">+{selectedPayroll.currency} {selectedPayroll.bonus.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Gross Pay</span>
                  <span className="text-white">
                    {selectedPayroll.currency} {(selectedPayroll.baseSalary + selectedPayroll.bonus).toLocaleString()}
                  </span>
                </div>
              </div>
              {selectedPayroll.deductions > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Deductions</span>
                  <span className="text-red-400">-{selectedPayroll.currency} {selectedPayroll.deductions.toLocaleString()}</span>
                </div>
              )}
              {selectedPayroll.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tax</span>
                  <span className="text-red-400">-{selectedPayroll.currency} {selectedPayroll.tax.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Net Pay</span>
                  <span className="text-elvion-primary font-bold text-lg">
                    {selectedPayroll.currency} {selectedPayroll.netPay.toLocaleString()}
                  </span>
                </div>
              </div>
              {selectedPayroll.notes && (
                <div className="mt-4 p-3 rounded-lg bg-white/5">
                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                  <p className="text-sm text-gray-300">{selectedPayroll.notes}</p>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                <DollarSign size={14} />
                <span>
                  Status: <span className="capitalize">{selectedPayroll.status}</span>
                  {selectedPayroll.paidDate && ` • Paid on ${new Date(selectedPayroll.paidDate).toLocaleDateString()}`}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-white/10">
              <button
                onClick={() => setSelectedPayroll(null)}
                className="w-full px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
