"use client";
import { useState, useEffect } from "react";
import {
  Building2, Plus, Search, Edit2, Trash2, X, Users, AlertCircle, DollarSign,
  ChevronDown, ChevronRight, ToggleLeft, ToggleRight
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Department {
  id: number;
  name: string;
  description: string | null;
  managerId: number | null;
  budget: number | null;
  isActive: boolean;
  _count: { employees: number };
  createdAt: string;
}

const emptyForm = { name: "", description: "", managerId: "", budget: "", isActive: true };

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deptEmployees, setDeptEmployees] = useState<Record<number, any[]>>({});

  const fetchDepartments = async () => {
    try {
      const data = await fetchAPI("/hr/departments");
      setDepartments(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  };

  const openEdit = (dept: Department) => {
    setEditing(dept);
    setForm({
      name: dept.name,
      description: dept.description || "",
      managerId: dept.managerId?.toString() || "",
      budget: dept.budget?.toString() || "",
      isActive: dept.isActive,
    });
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Department name is required"); return; }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await fetchAPI(`/hr/departments/${editing.id}`, {
          method: "PUT", body: JSON.stringify(form),
        });
      } else {
        await fetchAPI("/hr/departments", {
          method: "POST", body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      fetchDepartments();
    } catch (e: any) {
      setError(e.message || "Failed to save department");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure? Employees in this department will become unassigned.")) return;
    try {
      await fetchAPI(`/hr/departments/${id}`, { method: "DELETE" });
      fetchDepartments();
    } catch (e: any) { alert(e.message || "Failed to delete"); }
  };

  const toggleExpand = async (deptId: number) => {
    if (expandedId === deptId) { setExpandedId(null); return; }
    setExpandedId(deptId);
    if (!deptEmployees[deptId]) {
      try {
        const data = await fetchAPI(`/hr/departments/${deptId}`);
        setDeptEmployees(prev => ({ ...prev, [deptId]: data.employees || [] }));
      } catch (e) { console.error(e); }
    }
  };

  const totalBudget = departments.reduce((sum, d) => sum + (d.budget || 0), 0);
  const totalEmployees = departments.reduce((sum, d) => sum + d._count.employees, 0);
  const activeDepts = departments.filter(d => d.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Departments</h1>
          <p className="text-gray-400 text-sm mt-1">{departments.length} departments • {totalEmployees} employees</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition text-sm">
          <Plus size={16} /> Add Department
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-elvion-card border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg"><Building2 size={20} className="text-purple-400" /></div>
          <div><p className="text-2xl font-bold text-white">{activeDepts}</p><p className="text-xs text-gray-400">Active Departments</p></div>
        </div>
        <div className="bg-elvion-card border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg"><Users size={20} className="text-blue-400" /></div>
          <div><p className="text-2xl font-bold text-white">{totalEmployees}</p><p className="text-xs text-gray-400">Total Employees</p></div>
        </div>
        <div className="bg-elvion-card border border-white/10 rounded-xl p-4 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg"><DollarSign size={20} className="text-green-400" /></div>
          <div><p className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</p><p className="text-xs text-gray-400">Total Budget</p></div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" placeholder="Search departments..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary"
        />
      </div>

      {/* Department List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-elvion-card border border-white/10 rounded-xl">
          <Building2 size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Departments Found</h3>
          <p className="text-gray-500 text-sm mb-4">Create your first department to organize your team.</p>
          <button onClick={openAdd} className="px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium text-sm hover:bg-elvion-primary/90 transition">
            Add Department
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dept) => (
            <div key={dept.id} className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition" onClick={() => toggleExpand(dept.id)}>
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${dept.isActive ? "bg-elvion-primary/10" : "bg-gray-500/10"}`}>
                    <Building2 size={20} className={dept.isActive ? "text-elvion-primary" : "text-gray-500"} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-medium">{dept.name}</h3>
                      {!dept.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-500/10 text-gray-400">Inactive</span>}
                    </div>
                    {dept.description && <p className="text-gray-400 text-sm mt-0.5">{dept.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden sm:flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-white font-medium">{dept._count.employees}</p>
                      <p className="text-xs text-gray-500">Employees</p>
                    </div>
                    {dept.budget && (
                      <div className="text-right">
                        <p className="text-white font-medium">${dept.budget.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Budget</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(dept); }} className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(dept.id); }} className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition">
                      <Trash2 size={15} />
                    </button>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedId === dept.id ? "rotate-180" : ""}`} />
                  </div>
                </div>
              </div>
              {expandedId === dept.id && (
                <div className="border-t border-white/10 p-4 bg-elvion-dark/50">
                  {deptEmployees[dept.id] ? (
                    deptEmployees[dept.id].length === 0 ? (
                      <p className="text-gray-500 text-sm">No employees assigned to this department.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {deptEmployees[dept.id].map((emp: any) => (
                          <div key={emp.id} className="flex items-center gap-3 p-3 bg-elvion-card rounded-lg border border-white/5">
                            <div className="w-8 h-8 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-xs">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-white truncate">{emp.firstName} {emp.lastName}</p>
                              <p className="text-xs text-gray-500 truncate">{emp.positions?.length > 0 ? emp.positions.join(", ") : "N/A"} • {emp.employeeId}</p>
                            </div>
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${emp.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                              {emp.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-elvion-primary"></div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-elvion-card border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">{editing ? "Edit Department" : "Add Department"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Department Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" placeholder="e.g. Engineering" />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary resize-none" placeholder="Brief description..." />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Budget</label>
                <input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}
                  className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" placeholder="0.00" />
              </div>
              {editing && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Active Status</span>
                  <button
                    onClick={() => setForm({ ...form, isActive: !form.isActive })}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition ${form.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-500/10 text-gray-400"}`}
                  >
                    {form.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                    {form.isActive ? "Active" : "Inactive"}
                  </button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 bg-elvion-primary text-black rounded-lg font-medium text-sm hover:bg-elvion-primary/90 transition disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update" : "Create Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
