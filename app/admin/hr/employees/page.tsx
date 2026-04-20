"use client";
import { useState, useEffect } from "react";
import {
  Users, Plus, Search, Edit2, Trash2, X, ChevronDown,
  AlertCircle, KeyRound, Eye, EyeOff
} from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface Department { id: number; name: string; }
interface Employee {
  id: number; employeeId: string; firstName: string; lastName: string;
  email: string; phone: string | null; gender: string | null; positions: string[];
  employmentType: string; status: string; salary: number | null; currency: string;
  hireDate: string; dateOfBirth: string | null; address: string | null;
  city: string | null; country: string | null;
  emergencyName: string | null; emergencyPhone: string | null; emergencyRelation: string | null;
  departments: { id: number; name: string }[];
  userId: number | null;
  user: { id: number; name: string | null; email: string } | null;
}

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-400",
  on_leave: "bg-yellow-500/10 text-yellow-400",
  terminated: "bg-red-500/10 text-red-400",
  resigned: "bg-gray-500/10 text-gray-400",
};

const typeLabels: Record<string, string> = {
  full_time: "Full Time", part_time: "Part Time", contract: "Contract", intern: "Intern",
};

const positions = [
  // Leadership & Management
  "CEO", "CTO", "CFO", "COO", "CMO", "VP of Engineering", "VP of Marketing", "VP of Sales",
  "Director of Operations", "Director of Engineering", "Director of Marketing", "Director of HR",
  "Project Manager", "Product Manager", "Engineering Manager", "Marketing Manager", "HR Manager",
  "Team Lead", "Scrum Master",
  // Software & Engineering
  "Software Engineer", "Senior Software Engineer", "Staff Engineer", "Principal Engineer",
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "Mobile Developer", "iOS Developer", "Android Developer",
  "DevOps Engineer", "Cloud Engineer", "Site Reliability Engineer",
  "Data Engineer", "Data Scientist", "Machine Learning Engineer", "AI Engineer",
  "QA Engineer", "Automation Engineer", "Security Engineer",
  "Systems Architect", "Solutions Architect", "Technical Lead",
  "UI/UX Designer", "UX Researcher", "Product Designer",
  // Marketing & Creative
  "Marketing Specialist", "Digital Marketing Specialist", "SEO Specialist",
  "Content Strategist", "Content Writer", "Copywriter",
  "Social Media Manager", "Social Media Specialist",
  "Brand Manager", "Creative Director", "Art Director",
  "Graphic Designer", "Video Editor", "Motion Designer",
  "Performance Marketing Specialist", "Growth Marketing Manager",
  "Email Marketing Specialist", "PPC Specialist",
  // Sales & Business Development
  "Sales Representative", "Senior Sales Executive", "Account Manager", "Account Executive",
  "Business Development Manager", "Business Development Representative",
  "Sales Manager", "Regional Sales Manager",
  // HR & Admin
  "HR Specialist", "Recruiter", "Talent Acquisition Specialist",
  "Office Manager", "Administrative Assistant", "Executive Assistant",
  "Payroll Specialist", "Benefits Coordinator",
  // Finance & Accounting
  "Accountant", "Senior Accountant", "Financial Analyst", "Controller",
  "Bookkeeper", "Tax Specialist", "Billing Specialist",
  // Customer Support
  "Customer Support Representative", "Customer Success Manager",
  "Technical Support Engineer", "Support Team Lead",
  // Other
  "Intern", "Trainee", "Consultant", "Contractor", "Freelancer",
];

const emptyForm = {
  firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
  gender: "", address: "", city: "", country: "",
  departmentIds: [] as number[], positions: [] as string[], employmentType: "full_time",
  salary: "", currency: "USD", hireDate: new Date().toISOString().split("T")[0],
  emergencyName: "", emergencyPhone: "", emergencyRelation: "", userId: "",
  loginEmail: "", loginPassword: "",
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showPosDropdown, setShowPosDropdown] = useState(false);
  const [posSearch, setPosSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fetchEmployees = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterStatus) params.set("status", filterStatus);
      if (filterDept) params.set("departmentId", filterDept);
      const data = await fetchAPI(`/hr/employees?${params}`);
      setEmployees(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchDepts = async () => {
    try { setDepartments(await fetchAPI("/hr/departments")); } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchDepts(); }, []);
  useEffect(() => { fetchEmployees(); }, [search, filterStatus, filterDept]);

  const openAdd = () => {
    setEditingEmployee(null);
    setForm(emptyForm);
    setError("");
    setShowDeptDropdown(false);
    setShowPosDropdown(false);
    setPosSearch("");
    setShowPassword(false);
    setShowModal(true);
  };

  const openEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      firstName: emp.firstName, lastName: emp.lastName, email: emp.email,
      phone: emp.phone || "", dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "",
      gender: emp.gender || "", address: emp.address || "", city: emp.city || "",
      country: emp.country || "", departmentIds: emp.departments.map(d => d.id),
      positions: emp.positions || [], employmentType: emp.employmentType,
      salary: emp.salary?.toString() || "", currency: emp.currency,
      hireDate: emp.hireDate.split("T")[0],
      emergencyName: emp.emergencyName || "", emergencyPhone: emp.emergencyPhone || "",
      emergencyRelation: emp.emergencyRelation || "", userId: emp.userId?.toString() || "",
      loginEmail: emp.user?.email || "", loginPassword: "",
    });
    setError("");
    setShowDeptDropdown(false);
    setShowPosDropdown(false);
    setPosSearch("");
    setShowPassword(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      setError("First name, last name, and email are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      // Only include loginPassword if it's actually been entered
      const formData = { ...form };
      if (!formData.loginPassword) {
        delete (formData as any).loginPassword;
      }

      if (editingEmployee) {
        await fetchAPI(`/hr/employees/${editingEmployee.id}`, {
          method: "PUT", body: JSON.stringify(formData),
        });
      } else {
        await fetchAPI("/hr/employees", {
          method: "POST", body: JSON.stringify(formData),
        });
      }
      setShowModal(false);
      fetchEmployees();
    } catch (e: any) {
      setError(e.message || "Failed to save employee");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this employee? This will also delete their login account if one exists.")) return;
    try {
      await fetchAPI(`/hr/employees/${id}`, { method: "DELETE" });
      fetchEmployees();
    } catch (e: any) { alert(e.message || "Failed to delete"); }
  };

  const handleStatusChange = async (emp: Employee, newStatus: string) => {
    try {
      await fetchAPI(`/hr/employees/${emp.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchEmployees();
    } catch (e: any) { alert(e.message); }
  };

  const handleRemoveCredentials = async (emp: Employee) => {
    if (!confirm(`Remove login credentials for ${emp.firstName} ${emp.lastName}? They will no longer be able to log in.`)) return;
    try {
      await fetchAPI(`/hr/employees/${emp.id}`, {
        method: "PUT", body: JSON.stringify({ removeCredentials: true }),
      });
      fetchEmployees();
    } catch (e: unknown) {
      const err = e as { message?: string };
      alert(err.message || "Failed to remove credentials");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Employees</h1>
          <p className="text-gray-400 text-sm mt-1">{employees.length} total employees</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition text-sm">
          <Plus size={16} /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search employees..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary"
          />
        </div>
        <select
          value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="on_leave">On Leave</option>
          <option value="terminated">Terminated</option>
          <option value="resigned">Resigned</option>
        </select>
        <select
          value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-2 bg-elvion-card border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary"
        >
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
        </div>
      ) : employees.length === 0 ? (
        <div className="text-center py-16 bg-elvion-card border border-white/10 rounded-xl">
          <Users size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Employees Found</h3>
          <p className="text-gray-500 text-sm mb-4">Get started by adding your first employee.</p>
          <button onClick={openAdd} className="px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium text-sm hover:bg-elvion-primary/90 transition">
            Add Employee
          </button>
        </div>
      ) : (
        <div className="bg-elvion-card border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Position</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Login</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">Hire Date</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/5 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-xs">
                          {emp.firstName[0]}{emp.lastName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-gray-500">{emp.employeeId} • {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {emp.departments.length > 0 ? emp.departments.map(d => (
                          <span key={d.id} className="text-xs px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded-full">{d.name}</span>
                        )) : <span className="text-sm text-gray-500">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {emp.positions.length > 0 ? emp.positions.map(p => (
                          <span key={p} className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full">{p}</span>
                        )) : <span className="text-sm text-gray-500">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{typeLabels[emp.employmentType] || emp.employmentType}</td>
                    <td className="px-4 py-3">
                      <select
                        value={emp.status}
                        onChange={(e) => handleStatusChange(emp, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border-0 outline-none cursor-pointer ${statusColors[emp.status] || "bg-gray-500/10 text-gray-400"}`}
                      >
                        <option value="active">Active</option>
                        <option value="on_leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                        <option value="resigned">Resigned</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {emp.user ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400"></span>
                          <span className="text-xs text-green-400">Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          <span className="text-xs text-gray-500">None</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">{new Date(emp.hireDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(emp)} className="text-gray-400 hover:text-white p-1 transition"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(emp.id)} className="text-gray-400 hover:text-red-400 p-1 transition ml-1"><Trash2 size={15} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-20 overflow-y-auto">
          <div className="w-full max-w-2xl bg-elvion-card border border-white/10 rounded-xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">{editingEmployee ? "Edit Employee" : "Add New Employee"}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {error && <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2"><AlertCircle size={16} />{error}</div>}

              {/* Personal Info */}
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider">Personal Information</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">First Name *</label>
                  <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Last Name *</label>
                  <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Email *</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Date of Birth</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-3">
                  <label className="text-xs text-gray-400 mb-1 block">Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">City</label>
                  <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Country</label>
                  <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
              </div>

              {/* Employment */}
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider pt-2">Employment Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Multi-Select Departments */}
                <div className="relative">
                  <label className="text-xs text-gray-400 mb-1 block">Departments</label>
                  <div
                    onClick={() => { setShowDeptDropdown(!showDeptDropdown); setShowPosDropdown(false); }}
                    className="w-full min-h-[38px] px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus-within:border-elvion-primary cursor-pointer flex flex-wrap gap-1 items-center"
                  >
                    {form.departmentIds.length === 0 && <span className="text-gray-500">Select Departments</span>}
                    {form.departmentIds.map(id => {
                      const dept = departments.find(d => d.id === id);
                      return dept ? (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                          {dept.name}
                          <button type="button" onClick={(e) => { e.stopPropagation(); setForm({ ...form, departmentIds: form.departmentIds.filter(did => did !== id) }); }} className="hover:text-white">
                            <X size={10} />
                          </button>
                        </span>
                      ) : null;
                    })}
                    <ChevronDown size={14} className="ml-auto text-gray-500 shrink-0" />
                  </div>
                  {showDeptDropdown && (
                    <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-elvion-dark border border-white/10 rounded-lg shadow-xl">
                      {departments.map(d => (
                        <button key={d.id} type="button"
                          onClick={() => {
                            setForm({
                              ...form,
                              departmentIds: form.departmentIds.includes(d.id)
                                ? form.departmentIds.filter(id => id !== d.id)
                                : [...form.departmentIds, d.id]
                            });
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 flex items-center gap-2 ${form.departmentIds.includes(d.id) ? 'text-elvion-primary' : 'text-gray-300'}`}
                        >
                          <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${form.departmentIds.includes(d.id) ? 'bg-elvion-primary border-elvion-primary' : 'border-white/20'}`}>
                            {form.departmentIds.includes(d.id) && <span className="text-black text-xs">✓</span>}
                          </span>
                          {d.name}
                        </button>
                      ))}
                      {departments.length === 0 && <p className="px-3 py-2 text-xs text-gray-500">No departments available</p>}
                    </div>
                  )}
                </div>

                {/* Multi-Select Positions */}
                <div className="relative">
                  <label className="text-xs text-gray-400 mb-1 block">Positions / Roles</label>
                  <div
                    onClick={() => { setShowPosDropdown(!showPosDropdown); setShowDeptDropdown(false); }}
                    className="w-full min-h-[38px] px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus-within:border-elvion-primary cursor-pointer flex flex-wrap gap-1 items-center"
                  >
                    {form.positions.length === 0 && <span className="text-gray-500">Select Positions</span>}
                    {form.positions.map(p => (
                      <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                        {p}
                        <button type="button" onClick={(e) => { e.stopPropagation(); setForm({ ...form, positions: form.positions.filter(pos => pos !== p) }); }} className="hover:text-white">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <ChevronDown size={14} className="ml-auto text-gray-500 shrink-0" />
                  </div>
                  {showPosDropdown && (
                    <div className="absolute z-50 mt-1 w-full bg-elvion-dark border border-white/10 rounded-lg shadow-xl">
                      <div className="p-2 border-b border-white/10">
                        <input
                          type="text" placeholder="Search positions..." value={posSearch}
                          onChange={(e) => setPosSearch(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1.5 bg-white/5 border border-white/10 rounded text-white text-xs outline-none focus:border-elvion-primary"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {positions
                          .filter(p => p.toLowerCase().includes(posSearch.toLowerCase()))
                          .map(p => (
                          <button key={p} type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                positions: form.positions.includes(p)
                                  ? form.positions.filter(pos => pos !== p)
                                  : [...form.positions, p]
                              });
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 flex items-center gap-2 ${form.positions.includes(p) ? 'text-elvion-primary' : 'text-gray-300'}`}
                          >
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${form.positions.includes(p) ? 'bg-elvion-primary border-elvion-primary' : 'border-white/20'}`}>
                              {form.positions.includes(p) && <span className="text-black text-[9px]">✓</span>}
                            </span>
                            {p}
                          </button>
                        ))}
                        {positions.filter(p => p.toLowerCase().includes(posSearch.toLowerCase())).length === 0 && (
                          <p className="px-3 py-2 text-xs text-gray-500">No matching positions</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Employment Type</label>
                  <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="intern">Intern</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Hire Date</label>
                  <input type="date" value={form.hireDate} onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Salary</label>
                  <input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary">
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="PKR">PKR</option>
                    <option value="AED">AED</option>
                    <option value="SAR">SAR</option>
                  </select>
                </div>
              </div>

              {/* Emergency Contact */}
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider pt-2">Emergency Contact</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Name</label>
                  <input value={form.emergencyName} onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Phone</label>
                  <input value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Relation</label>
                  <input value={form.emergencyRelation} onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
              </div>

              {/* Login Credentials */}
              <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider pt-2 flex items-center gap-2">
                <KeyRound size={12} /> Login Credentials
              </p>
              {editingEmployee?.user && (
                <div className="flex items-center justify-between bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2">
                  <div>
                    <p className="text-xs text-green-400">This employee has an active login account</p>
                    <p className="text-xs text-gray-400 mt-0.5">{editingEmployee.user.email}</p>
                  </div>
                  <button type="button" onClick={() => { handleRemoveCredentials(editingEmployee); setShowModal(false); }}
                    className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition">
                    Remove Login
                  </button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    Login Email {!editingEmployee?.user && "(leave empty to skip)"}
                  </label>
                  <input type="email" value={form.loginEmail}
                    onChange={(e) => setForm({ ...form, loginEmail: e.target.value })}
                    placeholder={editingEmployee?.user ? "Update login email" : "employee@company.com"}
                    autoComplete="off"
                    className="w-full px-3 py-2 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">
                    {editingEmployee?.user ? "New Password (leave empty to keep current)" : "Password"}
                  </label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={form.loginPassword}
                      onChange={(e) => setForm({ ...form, loginPassword: e.target.value })}
                      placeholder={editingEmployee?.user ? "Leave empty to keep current" : "Min 6 characters"}
                      autoComplete="new-password"
                      className="w-full px-3 py-2 pr-10 bg-elvion-dark border border-white/10 rounded-lg text-white text-sm outline-none focus:border-elvion-primary" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500">Employee accounts are auto-verified — no email verification needed.</p>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-white/10">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white text-sm transition">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2 bg-elvion-primary text-black rounded-lg font-medium text-sm hover:bg-elvion-primary/90 transition disabled:opacity-50">
                {saving ? "Saving..." : editingEmployee ? "Update Employee" : "Add Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
