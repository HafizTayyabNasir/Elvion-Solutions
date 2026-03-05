"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CalendarDays,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

interface LeaveRequest {
  id: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  reason: string | null;
  createdAt: string;
  leaveType: { name: string };
}

interface LeaveBalance {
  typeId: number;
  type: string;
  total: number;
  used: number;
  remaining: number;
}

interface LeaveType {
  id: number;
  name: string;
  defaultDays: number;
  isPaid: boolean;
}

export default function EmployeeLeavesPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [balance, setBalance] = useState<LeaveBalance[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("");
  const [form, setForm] = useState({
    leaveTypeId: 0,
    startDate: "",
    endDate: "",
    reason: "",
  });

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const url = `/api/employee/leaves?year=${year}${filter ? `&status=${filter}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.leaves);
        setBalance(data.balance);
        setLeaveTypes(data.leaveTypes);
      }
    } catch {
      console.error("Failed to fetch leaves");
    } finally {
      setLoading(false);
    }
  }, [year, filter]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.leaveTypeId || !form.startDate || !form.endDate) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employee/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }
      setShowForm(false);
      setForm({ leaveTypeId: 0, startDate: "", endDate: "", reason: "" });
      fetchLeaves();
    } catch {
      alert("Failed to submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
      cancelled: "bg-gray-500/20 text-gray-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle2 size={14} />;
      case "rejected": return <XCircle size={14} />;
      case "pending": return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Leaves</h1>
          <p className="text-gray-400 mt-1">View leave balance and request time off</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition-colors flex items-center gap-2 w-fit"
        >
          <Plus size={16} /> Request Leave
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balance.map((lb) => (
          <div key={lb.type} className="bg-elvion-card rounded-xl border border-white/10 p-5">
            <h3 className="text-sm font-medium text-gray-400">{lb.type}</h3>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{lb.remaining}</span>
              <span className="text-sm text-gray-500 mb-1">/ {lb.total} days</span>
            </div>
            <div className="mt-3 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  lb.remaining <= 0 ? "bg-red-500" : lb.remaining <= 2 ? "bg-yellow-500" : "bg-elvion-primary"
                }`}
                style={{ width: `${Math.min((lb.used / Math.max(lb.total, 1)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">{lb.used} days used</p>
          </div>
        ))}
      </div>

      {/* Year Navigation + Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <span className="text-lg font-semibold text-white">{year}</span>
          <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex gap-2">
          {["", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-elvion-primary/20 text-elvion-primary"
                  : "text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-elvion-card rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-elvion-primary"></div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No leave requests found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Type</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">From</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">To</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Days</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Reason</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{leave.leaveType.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(leave.startDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {new Date(leave.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-white font-medium">{leave.totalDays}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                        {getStatusIcon(leave.status)}
                        <span className="capitalize">{leave.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400 max-w-[200px] truncate">
                      {leave.reason || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(leave.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leave Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-elvion-card rounded-2xl border border-white/10 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Request Leave</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Leave Type *</label>
                <select
                  value={form.leaveTypeId}
                  onChange={(e) => setForm({ ...form, leaveTypeId: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary focus:ring-1 focus:ring-elvion-primary outline-none"
                  required
                >
                  <option value={0}>Select leave type</option>
                  {leaveTypes.map((lt) => {
                    const bal = balance.find(b => b.typeId === lt.id);
                    return (
                      <option key={lt.id} value={lt.id}>
                        {lt.name} ({bal?.remaining || lt.defaultDays} days remaining)
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary focus:ring-1 focus:ring-elvion-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">End Date *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    min={form.startDate}
                    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary focus:ring-1 focus:ring-elvion-primary outline-none"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Reason</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary focus:ring-1 focus:ring-elvion-primary outline-none resize-none"
                  placeholder="Optional reason for the leave..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-elvion-primary text-black font-medium hover:bg-elvion-primary/90 transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
