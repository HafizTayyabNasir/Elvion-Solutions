"use client";
import { useState, useEffect } from "react";
import {
  Clock, Plus, Search, Edit2, Trash2, X, AlertCircle, Users,
  Calendar, CheckCircle2, XCircle, Timer, Wifi, Coffee
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Employee { id: number; employeeId: string; firstName: string; lastName: string; positions: string[]; departments: { name: string }[]; }
interface Attendance {
  id: number;
  employeeId: number;
  employee: Employee;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  status: string;
  hoursWorked: number | null;
  notes: string | null;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  present: { color: "bg-green-500/10 text-green-400", icon: CheckCircle2, label: "Present" },
  absent: { color: "bg-red-500/10 text-red-400", icon: XCircle, label: "Absent" },
  late: { color: "bg-yellow-500/10 text-yellow-400", icon: Timer, label: "Late" },
  half_day: { color: "bg-purple-500/10 text-purple-400", icon: Coffee, label: "Half Day" },
  remote: { color: "bg-blue-500/10 text-blue-400", icon: Wifi, label: "Remote" },
};

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);
  const [officeStart, setOfficeStart] = useState("09:00");
  const [officeEnd, setOfficeEnd] = useState("18:00");
  const [form, setForm] = useState({ employeeId: "", date: selectedDate, clockIn: "09:00", clockOut: "18:00", status: "present", hoursWorked: "8", notes: "" });
  const [bulkDate, setBulkDate] = useState(selectedDate);
  const [bulkRecords, setBulkRecords] = useState<Record<number, { status: string; clockIn: string; clockOut: string }>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchRecords = async () => {
    try {
      const params = new URLSearchParams();
      if (viewMode === "daily") { params.set("date", selectedDate); }
      else if (selectedMonth) { params.set("month", selectedMonth); }
      if (filterEmployee) params.set("employeeId", filterEmployee);
      if (filterStatus) params.set("status", filterStatus);
      const data = await fetchAPI(`/hr/attendance?${params}`);
      setRecords(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try {
      const data = await fetchAPI("/hr/employees?status=active");
      setEmployees(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAPI("/settings").then((s: Record<string, string>) => {
      const start = s.office_start_time || "09:00";
      const end   = s.office_end_time   || "18:00";
      setOfficeStart(start);
      setOfficeEnd(end);
      setForm(f => ({ ...f, clockIn: start, clockOut: end }));
    }).catch(() => {});
  }, []);
  useEffect(() => { setLoading(true); fetchRecords(); }, [selectedDate, selectedMonth, filterEmployee, filterStatus, viewMode]);

  const openAdd = () => {
    setEditing(null);
    setForm({ employeeId: "", date: selectedDate, clockIn: officeStart, clockOut: officeEnd, status: "present", hoursWorked: "8", notes: "" });
    setError("");
    setShowModal(true);
  };

  const openEdit = (rec: Attendance) => {
    setEditing(rec);
    setForm({
      employeeId: rec.employeeId.toString(),
      date: rec.date.split("T")[0],
      clockIn: rec.clockIn ? new Date(rec.clockIn).toISOString().slice(11, 16) : "",
      clockOut: rec.clockOut ? new Date(rec.clockOut).toISOString().slice(11, 16) : "",
      status: rec.status,
      hoursWorked: rec.hoursWorked?.toString() || "",
      notes: rec.notes || "",
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.employeeId || !form.date) { setError("Employee and date are required"); return; }
    setSaving(true);
    setError("");
    try {
      // Determine clock-out date — if clockOut time < clockIn time it's an overnight shift (next day)
      let clockInISO: string | null = null;
      let clockOutISO: string | null = null;
      let hoursWorked: string = form.hoursWorked;

      if (form.clockIn) {
        clockInISO = `${form.date}T${form.clockIn}:00.000Z`;
      }
      if (form.clockOut) {
        const [inH, inM]   = (form.clockIn || "00:00").split(":").map(Number);
        const [outH, outM] = form.clockOut.split(":").map(Number);
        const inMins  = inH  * 60 + inM;
        const outMins = outH * 60 + outM;

        if (form.clockIn && outMins <= inMins) {
          // Overnight — advance clock-out to next calendar day
          const nextDay = new Date(`${form.date}T00:00:00.000Z`);
          nextDay.setUTCDate(nextDay.getUTCDate() + 1);
          clockOutISO = `${nextDay.toISOString().split("T")[0]}T${form.clockOut}:00.000Z`;
        } else {
          clockOutISO = `${form.date}T${form.clockOut}:00.000Z`;
        }

        // Auto-calculate hours
        if (clockInISO) {
          const diffMs = new Date(clockOutISO).getTime() - new Date(clockInISO).getTime();
          hoursWorked = (Math.round((diffMs / 3_600_000) * 10) / 10).toString();
        }
      }

      const payload = {
        ...form,
        clockIn:     clockInISO,
        clockOut:    clockOutISO,
        hoursWorked,
      };
      if (editing) {
        await fetchAPI(`/hr/attendance/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await fetchAPI("/hr/attendance", { method: "POST", body: JSON.stringify(payload) });
      }
      setShowModal(false);
      fetchRecords();
    } catch (e: any) { setError(e.message || "Failed to save"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this attendance record?")) return;
    try { await fetchAPI(`/hr/attendance/${id}`, { method: "DELETE" }); fetchRecords(); }
    catch (e: any) { alert(e.message); }
  };

  const openBulk = () => {
    setBulkDate(selectedDate);
    const initialBulk: Record<number, { status: string; clockIn: string; clockOut: string }> = {};
    employees.forEach(emp => {
      const existing = records.find(r => r.employeeId === emp.id);
      initialBulk[emp.id] = {
        status: existing?.status || "present",
        clockIn: existing?.clockIn ? new Date(existing.clockIn).toISOString().slice(11, 16) : officeStart,
        clockOut: existing?.clockOut ? new Date(existing.clockOut).toISOString().slice(11, 16) : officeEnd,
      };
    });
    setBulkRecords(initialBulk);
    setShowBulkModal(true);
  };

  const handleBulkSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = Object.entries(bulkRecords).map(([empId, data]) => {
        let clockInISO: string | null = null;
        let clockOutISO: string | null = null;
        let hoursWorked: string | null = null;

        if (data.clockIn) clockInISO = `${bulkDate}T${data.clockIn}:00.000Z`;

        if (data.clockOut) {
          const [inH, inM]   = (data.clockIn || "00:00").split(":").map(Number);
          const [outH, outM] = data.clockOut.split(":").map(Number);
          if (data.clockIn && outH * 60 + outM <= inH * 60 + inM) {
            const nextDay = new Date(`${bulkDate}T00:00:00.000Z`);
            nextDay.setUTCDate(nextDay.getUTCDate() + 1);
            clockOutISO = `${nextDay.toISOString().split("T")[0]}T${data.clockOut}:00.000Z`;
          } else {
            clockOutISO = `${bulkDate}T${data.clockOut}:00.000Z`;
          }
          if (clockInISO) {
            const diffMs = new Date(clockOutISO).getTime() - new Date(clockInISO).getTime();
            hoursWorked = (Math.round((diffMs / 3_600_000) * 10) / 10).toString();
          }
        }

        return { employeeId: empId, date: bulkDate, clockIn: clockInISO, clockOut: clockOutISO, status: data.status, hoursWorked };
      });
      await fetchAPI("/hr/attendance", { method: "POST", body: JSON.stringify(payload) });
      setShowBulkModal(false);
      fetchRecords();
    } catch (e: any) { setError(e.message || "Failed to save bulk attendance"); }
    finally { setSaving(false); }
  };

  // Stats
  const presentCount = records.filter(r => r.status === "present").length;
  const absentCount = records.filter(r => r.status === "absent").length;
  const lateCount = records.filter(r => r.status === "late").length;
  const remoteCount = records.filter(r => r.status === "remote").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Attendance</h1>
          <p className="text-gray-400 text-sm mt-1">{records.length} records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openBulk} className="flex items-center gap-2 px-4 py-2 bg-elvion-card border border-white/10 text-white rounded-lg font-medium hover:bg-white/5 transition text-sm">
            <Users size={16} /> Bulk Mark
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition text-sm">
            <Plus size={16} /> Add Record
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Present", value: presentCount, color: "text-green-400", bg: "bg-green-500/10", icon: CheckCircle2 },
          { label: "Absent", value: absentCount, color: "text-red-400", bg: "bg-red-500/10", icon: XCircle },
          { label: "Late", value: lateCount, color: "text-yellow-400", bg: "bg-yellow-500/10", icon: Timer },
          { label: "Remote", value: remoteCount, color: "text-blue-400", bg: "bg-blue-500/10", icon: Wifi },
        ].map((s) => (
          <div key={s.label} className="bg-elvion-card border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg ${s.bg}`}><s.icon size={18} className={s.color} /></div>
            <div><p className="text-xl font-bold text-white">{s.value}</p><p className="text-xs text-gray-400">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center bg-elvion-card border border-white/10 rounded-lg overflow-hidden">
          <button onClick={() => setViewMode("daily")} className={`px-3 py-2 text-sm transition ${viewMode === "daily" ? "bg-elvion-primary text-black font-medium" : "text-gray-400 hover:text-white"}`}>Daily</button>
          <button onClick={() => { setViewMode("monthly"); if (!selectedMonth) setSelectedMonth(new Date().toISOString().slice(0, 7)); }} className={`px-3 py-2 text-sm transition ${viewMode === "monthly" ? "bg-elvion-primary text-black font-medium" : "text-gray-400 hover:text-white"}`}>Monthly</button>
        </div>
        {viewMode === "daily" ? (
          <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
        ) : (
          <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
        )}
        <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}
          className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
          <option value="">All Employees</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
          <option value="">All Status</option>
          {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 bg-elvion-card border border-white/10 rounded-xl">
          <Clock size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Attendance Records</h3>
          <p className="text-gray-500 text-sm mb-4">No records found for the selected date/filters.</p>
          <button onClick={openBulk} className="px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium text-sm hover:bg-elvion-primary/90 transition">
            Mark Attendance
          </button>
        </div>
      ) : (
        <div className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Clock In</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Clock Out</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Hours</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {records.map((rec) => {
                  const cfg = statusConfig[rec.status] || statusConfig.present;
                  const StatusIcon = cfg.icon;
                  return (
                    <tr key={rec.id} className="hover:bg-white/5 transition">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-xs">
                            {rec.employee.firstName[0]}{rec.employee.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{rec.employee.firstName} {rec.employee.lastName}</p>
                            <p className="text-xs text-gray-500">{rec.employee.employeeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{new Date(rec.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{rec.clockIn ? (() => { const t = new Date(rec.clockIn).toISOString().slice(11,16); const [h,m]=t.split(':').map(Number); return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`; })() : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{rec.clockOut ? (() => { const t = new Date(rec.clockOut).toISOString().slice(11,16); const [h,m]=t.split(':').map(Number); return `${h%12||12}:${String(m).padStart(2,'0')} ${h<12?'AM':'PM'}`; })() : "—"}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{rec.hoursWorked ? `${rec.hoursWorked}h` : "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${cfg.color}`}>
                          <StatusIcon size={12} /> {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => openEdit(rec)} className="text-gray-400 hover:text-white p-1 transition"><Edit2 size={15} /></button>
                        <button onClick={() => handleDelete(rec.id)} className="text-gray-400 hover:text-red-400 p-1 transition ml-1"><Trash2 size={15} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single Record Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-elvion-card border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">{editing ? "Edit Record" : "Add Attendance"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Employee *</label>
                <select value={form.employeeId} onChange={(e) => { const v = e.target.value; setForm(f => ({ ...f, employeeId: v })); }} disabled={!!editing}
                  className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary disabled:opacity-50">
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Date *</label>
                  <input type="date" value={form.date} onChange={(e) => { const v = e.target.value; setForm(f => ({ ...f, date: v })); }}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Status</label>
                  <select value={form.status} onChange={(e) => { const v = e.target.value; setForm(f => ({ ...f, status: v })); }}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
                    {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Clock In</label>
                  <input type="time" value={form.clockIn} onChange={(e) => { const v = e.target.value; setForm(f => ({ ...f, clockIn: v })); }}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Clock Out</label>
                  <input type="time" value={form.clockOut} onChange={(e) => { const v = e.target.value; setForm(f => ({ ...f, clockOut: v })); }}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Notes</label>
                <input value={form.notes} onChange={(e) => { const v = e.target.value; setForm(f => ({ ...f, notes: v })); }}
                  className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" placeholder="Optional notes..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 bg-elvion-primary text-black rounded-lg font-medium text-sm hover:bg-elvion-primary/90 transition disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Save Record"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Attendance Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto">
          <div className="w-full max-w-3xl bg-elvion-card border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">Bulk Attendance</h2>
                <p className="text-sm text-gray-400 mt-1">Mark attendance for all active employees</p>
              </div>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6">
              {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2 mb-4"><AlertCircle size={16} />{error}</div>}
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-1 block">Date</label>
                <input type="date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)}
                  className="px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
              </div>
              <div className="max-h-[50vh] overflow-y-auto border border-white/10 rounded-lg">
                <table className="w-full">
                  <thead className="sticky top-0 bg-elvion-card">
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Employee</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Clock In</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Clock Out</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-white/5">
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-xs">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <span className="text-sm text-white">{emp.firstName} {emp.lastName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <select
                            value={bulkRecords[emp.id]?.status || "present"}
                            onChange={(e) => setBulkRecords(prev => ({ ...prev, [emp.id]: { ...prev[emp.id], status: e.target.value } }))}
                            className="px-2 py-1 bg-elvion-dark border border-white/10 rounded-lg text-white text-xs outline-none focus:border-elvion-primary"
                          >
                            {Object.entries(statusConfig).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input type="time"
                            value={bulkRecords[emp.id]?.clockIn || "09:00"}
                            onChange={(e) => setBulkRecords(prev => ({ ...prev, [emp.id]: { ...prev[emp.id], clockIn: e.target.value } }))}
                            className="px-2 py-1 bg-elvion-dark border border-white/10 rounded-lg text-white text-xs outline-none focus:border-elvion-primary w-24"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input type="time"
                            value={bulkRecords[emp.id]?.clockOut || "17:00"}
                            onChange={(e) => setBulkRecords(prev => ({ ...prev, [emp.id]: { ...prev[emp.id], clockOut: e.target.value } }))}
                            className="px-2 py-1 bg-elvion-dark border border-white/10 rounded-lg text-white text-xs outline-none focus:border-elvion-primary w-24"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition">Cancel</button>
              <button onClick={handleBulkSave} disabled={saving}
                className="px-6 py-2 bg-elvion-primary text-black rounded-lg font-medium text-sm hover:bg-elvion-primary/90 transition disabled:opacity-50">
                {saving ? "Saving..." : `Save ${employees.length} Records`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
