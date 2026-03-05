"use client";
import { useState, useEffect } from "react";
import {
  CalendarCheck, Plus, Trash2, X, AlertCircle,
  CheckCircle2, XCircle, Clock, FileText,
  ThumbsUp, ThumbsDown, Eye, Settings2
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Employee {
  id: number; employeeId: string; firstName: string; lastName: string;
  position: string | null; department: { name: string } | null;
}
interface LeaveType { id: number; name: string; description: string | null; defaultDays: number; isPaid: boolean; isActive: boolean; }
interface LeaveRequest {
  id: number; employeeId: number; leaveTypeId: number;
  employee: Employee;
  leaveType: { id: number; name: string; isPaid: boolean };
  startDate: string; endDate: string; totalDays: number;
  reason: string | null; status: string;
  approvedBy: number | null; approvalNote: string | null;
  createdAt: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending: { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock, label: "Pending" },
  approved: { color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2, label: "Approved" },
  rejected: { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle, label: "Rejected" },
  cancelled: { color: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: X, label: "Cancelled" },
};

export default function LeavesPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState<LeaveRequest | null>(null);
  const [form, setForm] = useState({ employeeId: "", leaveTypeId: "", startDate: "", endDate: "", reason: "" });
  const [typeForm, setTypeForm] = useState({ name: "", description: "", defaultDays: "0", isPaid: true });
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [approvalNote, setApprovalNote] = useState("");
  const [activeTab, setActiveTab] = useState<"requests" | "types">("requests");

  const fetchRequests = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (filterEmployee) params.set("employeeId", filterEmployee);
      const data = await fetchAPI(`/hr/leaves?${params}`);
      setRequests(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    try { setEmployees(await fetchAPI("/hr/employees?status=active")); } catch (e) { console.error(e); }
  };

  const fetchLeaveTypes = async () => {
    try { setLeaveTypes(await fetchAPI("/hr/leave-types")); } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchEmployees(); fetchLeaveTypes(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setLoading(true); fetchRequests(); }, [filterStatus, filterEmployee]);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const s = new Date(start);
    const e = new Date(end);
    return Math.max(1, Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  };

  const handleCreateRequest = async () => {
    if (!form.employeeId || !form.leaveTypeId || !form.startDate || !form.endDate) {
      setError("Employee, leave type, start date, and end date are required");
      return;
    }
    setSaving(true); setError("");
    try {
      const totalDays = calculateDays(form.startDate, form.endDate);
      await fetchAPI("/hr/leaves", {
        method: "POST",
        body: JSON.stringify({ ...form, employeeId: parseInt(form.employeeId), leaveTypeId: parseInt(form.leaveTypeId), totalDays }),
      });
      setShowModal(false);
      setForm({ employeeId: "", leaveTypeId: "", startDate: "", endDate: "", reason: "" });
      fetchRequests();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to create leave request"); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await fetchAPI(`/hr/leaves/${id}`, {
        method: "PUT",
        body: JSON.stringify({ status, approvalNote }),
      });
      setApprovalNote("");
      setShowDetailModal(null);
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this leave request?")) return;
    try {
      await fetchAPI(`/hr/leaves/${id}`, { method: "DELETE" });
      fetchRequests();
    } catch (e) { console.error(e); }
  };

  const handleSaveType = async () => {
    if (!typeForm.name.trim()) { setError("Leave type name is required"); return; }
    setSaving(true); setError("");
    try {
      if (editingType) {
        // No PUT for leave types currently, skip edit
        setError("Editing leave types not supported yet");
      } else {
        await fetchAPI("/hr/leave-types", {
          method: "POST",
          body: JSON.stringify(typeForm),
        });
      }
      setShowTypeModal(false);
      setTypeForm({ name: "", description: "", defaultDays: "0", isPaid: true });
      setEditingType(null);
      fetchLeaveTypes();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to save leave type"); }
    finally { setSaving(false); }
  };

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leave Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage employee leave requests and leave types</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setActiveTab("types"); setShowTypeModal(true); setError(""); setEditingType(null); setTypeForm({ name: "", description: "", defaultDays: "0", isPaid: true }); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition text-sm"
          >
            <Settings2 size={16} /> Leave Types
          </button>
          <button
            onClick={() => { setShowModal(true); setError(""); setForm({ employeeId: "", leaveTypeId: "", startDate: "", endDate: "", reason: "" }); }}
            className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition text-sm"
          >
            <Plus size={16} /> New Request
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: requests.length, icon: FileText, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Pending", value: pendingCount, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Rejected", value: rejectedCount, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
        ].map((card) => (
          <div key={card.label} className="bg-elvion-card border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${card.bg}`}>
                <card.icon size={20} className={card.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-gray-400">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-elvion-card border border-white/10 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "requests" ? "bg-elvion-primary text-black" : "text-gray-400 hover:text-white"}`}
        >
          Leave Requests
        </button>
        <button
          onClick={() => setActiveTab("types")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === "types" ? "bg-elvion-primary text-black" : "text-gray-400 hover:text-white"}`}
        >
          Leave Types
        </button>
      </div>

      {activeTab === "requests" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-elvion-card border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-elvion-primary"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterEmployee}
              onChange={e => setFilterEmployee(e.target.value)}
              className="bg-elvion-card border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-elvion-primary"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
              ))}
            </select>
          </div>

          {/* Leave Requests Table */}
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-elvion-primary"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 bg-elvion-card border border-white/10 rounded-xl">
              <CalendarCheck size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No leave requests found</p>
              <p className="text-gray-600 text-sm mt-1">Create a new leave request to get started</p>
            </div>
          ) : (
            <div className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 font-medium p-4">Employee</th>
                      <th className="text-left text-gray-400 font-medium p-4">Leave Type</th>
                      <th className="text-left text-gray-400 font-medium p-4">Duration</th>
                      <th className="text-left text-gray-400 font-medium p-4">Days</th>
                      <th className="text-left text-gray-400 font-medium p-4">Status</th>
                      <th className="text-left text-gray-400 font-medium p-4">Submitted</th>
                      <th className="text-right text-gray-400 font-medium p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(req => {
                      const cfg = statusConfig[req.status] || statusConfig.pending;
                      const StatusIcon = cfg.icon;
                      return (
                        <tr key={req.id} className="border-b border-white/5 hover:bg-white/2 transition">
                          <td className="p-4">
                            <div>
                              <p className="text-white font-medium">{req.employee.firstName} {req.employee.lastName}</p>
                              <p className="text-gray-500 text-xs">{req.employee.position} {req.employee.department ? `• ${req.employee.department.name}` : ""}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="text-white">{req.leaveType.name}</span>
                            {req.leaveType.isPaid && <span className="ml-2 text-[10px] bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded">Paid</span>}
                          </td>
                          <td className="p-4 text-gray-300">
                            <p>{new Date(req.startDate).toLocaleDateString()}</p>
                            <p className="text-gray-500 text-xs">to {new Date(req.endDate).toLocaleDateString()}</p>
                          </td>
                          <td className="p-4 text-white font-medium">{req.totalDays}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                              <StatusIcon size={12} /> {cfg.label}
                            </span>
                          </td>
                          <td className="p-4 text-gray-400 text-xs">{new Date(req.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => { setShowDetailModal(req); setApprovalNote(""); }} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-blue-400 transition" title="View">
                                <Eye size={16} />
                              </button>
                              {req.status === "pending" && (
                                <>
                                  <button onClick={() => handleStatusChange(req.id, "approved")} className="p-1.5 rounded-lg hover:bg-green-500/10 text-gray-400 hover:text-green-400 transition" title="Approve">
                                    <ThumbsUp size={16} />
                                  </button>
                                  <button onClick={() => handleStatusChange(req.id, "rejected")} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition" title="Reject">
                                    <ThumbsDown size={16} />
                                  </button>
                                </>
                              )}
                              <button onClick={() => handleDelete(req.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition" title="Delete">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "types" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => { setShowTypeModal(true); setError(""); setEditingType(null); setTypeForm({ name: "", description: "", defaultDays: "0", isPaid: true }); }}
              className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition text-sm"
            >
              <Plus size={16} /> Add Leave Type
            </button>
          </div>
          {leaveTypes.length === 0 ? (
            <div className="text-center py-16 bg-elvion-card border border-white/10 rounded-xl">
              <Settings2 size={48} className="text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No leave types configured</p>
              <p className="text-gray-600 text-sm mt-1">Add leave types like Annual, Sick, etc.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveTypes.map(lt => (
                <div key={lt.id} className="bg-elvion-card border border-white/10 rounded-xl p-5 hover:border-white/20 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-elvion-primary/10 rounded-lg">
                        <CalendarCheck size={20} className="text-elvion-primary" />
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">{lt.name}</h3>
                        {lt.description && <p className="text-gray-500 text-xs mt-0.5">{lt.description}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Default Days: </span>
                      <span className="text-white font-medium">{lt.defaultDays}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${lt.isPaid ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}>
                      {lt.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* New Leave Request Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elvion-card border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Leave Request</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Employee *</label>
                <select value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary">
                  <option value="">Select employee</option>
                  {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName} ({emp.employeeId})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Leave Type *</label>
                <select value={form.leaveTypeId} onChange={e => setForm({ ...form, leaveTypeId: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary">
                  <option value="">Select leave type</option>
                  {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name} {lt.isPaid ? "(Paid)" : "(Unpaid)"}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Date *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Date *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} min={form.startDate} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" />
                </div>
              </div>
              {form.startDate && form.endDate && (
                <div className="text-sm text-elvion-primary bg-elvion-primary/5 border border-elvion-primary/20 rounded-lg p-3">
                  Total Days: <strong>{calculateDays(form.startDate, form.endDate)}</strong>
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Reason</label>
                <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} rows={3} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary resize-none" placeholder="Optional reason for leave..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition text-sm font-medium">Cancel</button>
              <button onClick={handleCreateRequest} disabled={saving} className="flex-1 py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition text-sm disabled:opacity-50">
                {saving ? "Creating..." : "Create Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Type Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elvion-card border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{editingType ? "Edit Leave Type" : "Add Leave Type"}</h2>
              <button onClick={() => setShowTypeModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name *</label>
                <input value={typeForm.name} onChange={e => setTypeForm({ ...typeForm, name: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" placeholder="e.g. Annual Leave" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <input value={typeForm.description} onChange={e => setTypeForm({ ...typeForm, description: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" placeholder="Optional description" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Default Days</label>
                <input type="number" value={typeForm.defaultDays} onChange={e => setTypeForm({ ...typeForm, defaultDays: e.target.value })} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary" min="0" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={typeForm.isPaid} onChange={e => setTypeForm({ ...typeForm, isPaid: e.target.checked })} className="w-4 h-4 rounded accent-elvion-primary" />
                <span className="text-sm text-gray-300">Paid Leave</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTypeModal(false)} className="flex-1 py-2.5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition text-sm font-medium">Cancel</button>
              <button onClick={handleSaveType} disabled={saving} className="flex-1 py-2.5 bg-elvion-primary text-black rounded-lg font-semibold hover:bg-elvion-primary/90 transition text-sm disabled:opacity-50">
                {saving ? "Saving..." : editingType ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail / Approve-Reject Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-elvion-card border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Leave Request Details</h2>
              <button onClick={() => setShowDetailModal(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Employee</p>
                  <p className="text-white font-medium">{showDetailModal.employee.firstName} {showDetailModal.employee.lastName}</p>
                  <p className="text-gray-500 text-xs">{showDetailModal.employee.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="text-white">{showDetailModal.employee.department?.name || "Unassigned"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Leave Type</p>
                  <p className="text-white">{showDetailModal.leaveType.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${(statusConfig[showDetailModal.status] || statusConfig.pending).color}`}>
                    {(statusConfig[showDetailModal.status] || statusConfig.pending).label}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="text-white">{new Date(showDetailModal.startDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="text-white">{new Date(showDetailModal.endDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Days</p>
                  <p className="text-white font-bold text-lg">{showDetailModal.totalDays}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-white">{new Date(showDetailModal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {showDetailModal.reason && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Reason</p>
                  <p className="text-gray-300 bg-elvion-dark p-3 rounded-lg text-sm">{showDetailModal.reason}</p>
                </div>
              )}
              {showDetailModal.approvalNote && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Approval Note</p>
                  <p className="text-gray-300 bg-elvion-dark p-3 rounded-lg text-sm">{showDetailModal.approvalNote}</p>
                </div>
              )}
              {showDetailModal.status === "pending" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Approval Note (Optional)</label>
                    <textarea value={approvalNote} onChange={e => setApprovalNote(e.target.value)} rows={2} className="w-full bg-elvion-dark border border-white/10 text-white rounded-lg p-3 text-sm outline-none focus:border-elvion-primary resize-none" placeholder="Add a note..." />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => handleStatusChange(showDetailModal.id, "rejected")} className="flex-1 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-semibold hover:bg-red-500/20 transition text-sm flex items-center justify-center gap-2">
                      <ThumbsDown size={16} /> Reject
                    </button>
                    <button onClick={() => handleStatusChange(showDetailModal.id, "approved")} className="flex-1 py-2.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg font-semibold hover:bg-green-500/20 transition text-sm flex items-center justify-center gap-2">
                      <ThumbsUp size={16} /> Approve
                    </button>
                  </div>
                </>
              )}
            </div>
            {showDetailModal.status !== "pending" && (
              <div className="mt-6">
                <button onClick={() => setShowDetailModal(null)} className="w-full py-2.5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/5 transition text-sm font-medium">Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
