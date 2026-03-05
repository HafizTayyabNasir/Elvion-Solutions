"use client";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import {
  Clock,
  CalendarDays,
  Wallet,
  Building2,
  Briefcase,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  LogIn,
  LogOut,
} from "lucide-react";

interface DashboardData {
  employee: {
    id: number;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    departments: { id: number; name: string }[];
    positions: string[];
    employmentType: string;
    status: string;
    hireDate: string;
  };
  attendance: {
    today: {
      id: number;
      clockIn: string | null;
      clockOut: string | null;
      status: string;
      hoursWorked: number | null;
    } | null;
    monthStats: {
      present: number;
      late: number;
      absent: number;
      totalHours: number;
      totalDays: number;
    };
  };
  leaves: {
    pending: number;
    totalUsed: number;
    balance: { type: string; total: number; used: number; remaining: number }[];
    recent: {
      id: number;
      startDate: string;
      endDate: string;
      totalDays: number;
      status: string;
      reason: string | null;
      leaveType: { name: string };
    }[];
  };
  payroll: {
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
  }[];
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employee/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to load dashboard");
      }
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleClock = async (action: "clock_in" | "clock_out") => {
    setClockLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employee/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      await fetchDashboard();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Action failed");
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400 mb-4">{error || "No employee record linked to your account."}</p>
        <Link href="/" className="text-elvion-primary hover:underline">
          Go to Home
        </Link>
      </div>
    );
  }

  const { employee, attendance, leaves, payroll } = data;
  const todayAttendance = attendance.today;
  const canClockIn = !todayAttendance;
  const canClockOut = todayAttendance && !todayAttendance.clockOut;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400",
      approved: "bg-green-500/20 text-green-400",
      rejected: "bg-red-500/20 text-red-400",
      cancelled: "bg-gray-500/20 text-gray-400",
      present: "bg-green-500/20 text-green-400",
      late: "bg-yellow-500/20 text-yellow-400",
      absent: "bg-red-500/20 text-red-400",
      remote: "bg-blue-500/20 text-blue-400",
      paid: "bg-green-500/20 text-green-400",
      processed: "bg-blue-500/20 text-blue-400",
      draft: "bg-gray-500/20 text-gray-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">
            Welcome, {employee.firstName} {employee.lastName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {employee.departments.map(d => (
              <span key={d.id} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                {d.name}
              </span>
            ))}
            {employee.positions.map(p => (
              <span key={p} className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Briefcase size={16} />
          <span>ID: {employee.employeeId}</span>
          <span className="mx-1">•</span>
          <span className="capitalize">{employee.employmentType.replace("_", " ")}</span>
        </div>
      </div>

      {/* Clock In/Out Card */}
      <div className="bg-elvion-card rounded-xl border border-white/10 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Timer size={20} /> Time Tracker
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
            {todayAttendance && (
              <div className="flex items-center gap-4 mt-2 text-sm">
                {todayAttendance.clockIn && (
                  <span className="text-green-400">
                    <LogIn size={14} className="inline mr-1" />
                    In: {new Date(todayAttendance.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {todayAttendance.clockOut && (
                  <span className="text-red-400">
                    <LogOut size={14} className="inline mr-1" />
                    Out: {new Date(todayAttendance.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                {todayAttendance.hoursWorked !== null && (
                  <span className="text-gray-400">
                    {todayAttendance.hoursWorked}h worked
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(todayAttendance.status)}`}>
                  {todayAttendance.status}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            {canClockIn && (
              <button
                onClick={() => handleClock("clock_in")}
                disabled={clockLoading}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <LogIn size={18} />
                Clock In
              </button>
            )}
            {canClockOut && (
              <button
                onClick={() => handleClock("clock_out")}
                disabled={clockLoading}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <LogOut size={18} />
                Clock Out
              </button>
            )}
            {todayAttendance && todayAttendance.clockOut && (
              <div className="flex items-center gap-2 px-4 py-3 bg-elvion-primary/10 rounded-lg text-elvion-primary">
                <CheckCircle2 size={18} />
                <span className="font-medium">Day Complete</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Link
          href="/employee/attendance"
          className="bg-elvion-card rounded-xl p-6 border border-white/10 hover:border-elvion-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-500" />
            </div>
            <TrendingUp className="w-5 h-5 text-gray-600" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {attendance.monthStats.present + attendance.monthStats.late}
            </p>
            <p className="text-sm text-gray-400 mt-1">Days Present (Month)</p>
          </div>
        </Link>

        <Link
          href="/employee/leaves"
          className="bg-elvion-card rounded-xl p-6 border border-white/10 hover:border-elvion-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-yellow-500" />
            </div>
            {leaves.pending > 0 && (
              <span className="bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-full">
                {leaves.pending} pending
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{leaves.totalUsed}</p>
            <p className="text-sm text-gray-400 mt-1">Leaves Used (Year)</p>
          </div>
        </Link>

        <Link
          href="/employee/payroll"
          className="bg-elvion-card rounded-xl p-6 border border-white/10 hover:border-elvion-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">
              {payroll.length > 0 ? `${payroll[0].currency} ${payroll[0].netPay.toLocaleString()}` : "—"}
            </p>
            <p className="text-sm text-gray-400 mt-1">Last Payslip</p>
          </div>
        </Link>

        <Link
          href="/employee/attendance"
          className="bg-elvion-card rounded-xl p-6 border border-white/10 hover:border-elvion-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-white">{attendance.monthStats.totalHours}h</p>
            <p className="text-sm text-gray-400 mt-1">Hours This Month</p>
          </div>
        </Link>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Balance */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Leave Balance</h2>
            <Link
              href="/employee/leaves"
              className="text-sm text-elvion-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {leaves.balance.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No leave types configured</p>
            ) : (
              <div className="space-y-4">
                {leaves.balance.map((lb) => (
                  <div key={lb.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{lb.type}</span>
                      <span className="text-gray-400">
                        {lb.used} / {lb.total} days used
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          lb.remaining <= 0 ? "bg-red-500" : lb.remaining <= 2 ? "bg-yellow-500" : "bg-elvion-primary"
                        }`}
                        style={{ width: `${Math.min((lb.used / Math.max(lb.total, 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {lb.remaining > 0 ? `${lb.remaining} days remaining` : "No days remaining"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Leave Requests</h2>
            <Link
              href="/employee/leaves"
              className="text-sm text-elvion-primary hover:underline flex items-center gap-1"
            >
              Request leave <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {leaves.recent.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No leave requests this year</p>
            ) : (
              <div className="space-y-3">
                {leaves.recent.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm">{leave.leaveType.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                        <span className="ml-2">({leave.totalDays} days)</span>
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Payslips */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent Payslips</h2>
            <Link
              href="/employee/payroll"
              className="text-sm text-elvion-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-4">
            {payroll.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No payroll records</p>
            ) : (
              <div className="space-y-3">
                {payroll.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                  >
                    <div>
                      <p className="font-medium text-white text-sm">
                        {monthNames[p.month - 1]} {p.year}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Base: {p.currency} {p.baseSalary.toLocaleString()}
                        {p.bonus > 0 && ` + Bonus: ${p.bonus.toLocaleString()}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-elvion-primary text-sm">
                        {p.currency} {p.netPay.toLocaleString()}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Monthly Attendance</h2>
            <Link
              href="/employee/attendance"
              className="text-sm text-elvion-primary hover:underline flex items-center gap-1"
            >
              View details <ArrowRight size={14} />
            </Link>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-green-500/10">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{attendance.monthStats.present}</p>
                <p className="text-xs text-gray-400">Present</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{attendance.monthStats.late}</p>
                <p className="text-xs text-gray-400">Late</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-red-500/10">
                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{attendance.monthStats.absent}</p>
                <p className="text-xs text-gray-400">Absent</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{attendance.monthStats.totalHours}h</p>
                <p className="text-xs text-gray-400">Total Hours</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
