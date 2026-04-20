"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  LogIn,
  LogOut,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Monitor,
  Timer,
} from "lucide-react";

interface AttendanceRecord {
  id: number;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  hoursWorked: number | null;
  notes: string | null;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  remote: number;
  halfDay: number;
  totalHours: number;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function EmployeeAttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/employee/attendance?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data.attendance);
        setStats(data.stats);
      }
    } catch {
      console.error("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleClock = async (action: "clock_in" | "clock_out") => {
    setClockLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employee/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message);
        return;
      }
      fetchAttendance();
    } catch {
      alert("Action failed");
    } finally {
      setClockLoading(false);
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present": return <CheckCircle2 size={16} className="text-green-500" />;
      case "late": return <AlertCircle size={16} className="text-yellow-500" />;
      case "absent": return <XCircle size={16} className="text-red-500" />;
      case "remote": return <Monitor size={16} className="text-blue-500" />;
      case "half_day": return <Timer size={16} className="text-orange-500" />;
      default: return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      present: "bg-green-500/20 text-green-400",
      late: "bg-yellow-500/20 text-yellow-400",
      absent: "bg-red-500/20 text-red-400",
      remote: "bg-blue-500/20 text-blue-400",
      half_day: "bg-orange-500/20 text-orange-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  // Determine clock in/out for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayRecord = records.find(r => {
    const rd = new Date(r.date);
    rd.setHours(0, 0, 0, 0);
    return rd.getTime() === today.getTime();
  });
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Attendance</h1>
          <p className="text-gray-400 mt-1">Track your daily attendance and working hours</p>
        </div>
        {isCurrentMonth && (
          <div className="flex gap-3">
            {!todayRecord && (
              <button
                onClick={() => handleClock("clock_in")}
                disabled={clockLoading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <LogIn size={16} /> Clock In
              </button>
            )}
            {todayRecord && !todayRecord.clockOut && (
              <button
                onClick={() => handleClock("clock_out")}
                disabled={clockLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <LogOut size={16} /> Clock Out
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: "Present", value: stats.present, color: "text-green-500", bg: "bg-green-500/10" },
            { label: "Late", value: stats.late, color: "text-yellow-500", bg: "bg-yellow-500/10" },
            { label: "Absent", value: stats.absent, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Remote", value: stats.remote, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Half Day", value: stats.halfDay, color: "text-orange-500", bg: "bg-orange-500/10" },
            { label: "Total Hours", value: stats.totalHours, color: "text-purple-500", bg: "bg-purple-500/10" },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-elvion-card rounded-xl border border-white/10 p-4">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-white">
          {monthNames[month - 1]} {year}
        </h2>
        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Attendance Table */}
      <div className="bg-elvion-card rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-elvion-primary"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No attendance records for this month</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Date</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Clock In</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Clock Out</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Hours</th>
                  <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">
                      {new Date(record.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${getStatusBadge(record.status)}`}>
                        {getStatusIcon(record.status)}
                        <span className="capitalize">{record.status.replace("_", " ")}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {record.hoursWorked !== null ? `${record.hoursWorked}h` : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {record.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
