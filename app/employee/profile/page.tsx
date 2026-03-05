"use client";
import { useState, useEffect, useCallback } from "react";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  Shield,
  Save,
  AlertCircle,
} from "lucide-react";

interface EmployeeProfile {
  id: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  avatar: string | null;
  departments: { id: number; name: string }[];
  positions: string[];
  employmentType: string;
  status: string;
  hireDate: string;
  salary: number | null;
  currency: string;
  emergencyName: string | null;
  emergencyPhone: string | null;
  emergencyRelation: string | null;
}

export default function EmployeeProfilePage() {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    phone: "",
    address: "",
    city: "",
    country: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employee/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const data = await res.json();
      setProfile(data);
      setForm({
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "",
        emergencyName: data.emergencyName || "",
        emergencyPhone: data.emergencyPhone || "",
        emergencyRelation: data.emergencyRelation || "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employee/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      const data = await res.json();
      setProfile(data);
      setEditMode(false);
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <p className="text-gray-400">{error || "No employee record found"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 mt-1">View and update your personal information</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition-colors w-fit"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => { setEditMode(false); fetchProfile(); }}
              className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {success && (
        <div className="p-4 rounded-lg bg-green-500/20 text-green-400 text-sm">{success}</div>
      )}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/20 text-red-400 text-sm">{error}</div>
      )}

      {/* Profile Header Card */}
      <div className="bg-elvion-card rounded-xl border border-white/10 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary text-3xl font-bold shrink-0">
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {profile.departments.map(d => (
                <span key={d.id} className="text-xs px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-400">
                  {d.name}
                </span>
              ))}
              {profile.positions.map(p => (
                <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400">
                  {p}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Briefcase size={14} /> {profile.employeeId}</span>
              <span className="flex items-center gap-1 capitalize"><Shield size={14} /> {profile.employmentType.replace("_", " ")}</span>
              <span className="flex items-center gap-1"><Calendar size={14} /> Joined {new Date(profile.hireDate).toLocaleDateString()}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                profile.status === "active" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
              } capitalize`}>{profile.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <UserCircle size={20} /> Personal Information
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Email</label>
              <div className="flex items-center gap-2 mt-1 text-gray-300">
                <Mail size={16} className="text-gray-500" />
                <span>{profile.email}</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Phone</label>
              {editMode ? (
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary outline-none"
                  placeholder="Phone number"
                />
              ) : (
                <div className="flex items-center gap-2 mt-1 text-gray-300">
                  <Phone size={16} className="text-gray-500" />
                  <span>{profile.phone || "Not set"}</span>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Gender</label>
              <p className="mt-1 text-gray-300 capitalize">{profile.gender || "Not set"}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Date of Birth</label>
              <p className="mt-1 text-gray-300">
                {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MapPin size={20} /> Address
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Street Address</label>
              {editMode ? (
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary outline-none resize-none"
                  placeholder="Street address"
                />
              ) : (
                <p className="mt-1 text-gray-300">{profile.address || "Not set"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">City</label>
              {editMode ? (
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary outline-none"
                  placeholder="City"
                />
              ) : (
                <p className="mt-1 text-gray-300">{profile.city || "Not set"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Country</label>
              {editMode ? (
                <input
                  type="text"
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary outline-none"
                  placeholder="Country"
                />
              ) : (
                <p className="mt-1 text-gray-300">{profile.country || "Not set"}</p>
              )}
            </div>
          </div>
        </div>

        {/* Employment Info (Read-only) */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 size={20} /> Employment Details
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Employee ID</label>
              <p className="mt-1 text-gray-300">{profile.employeeId}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Departments</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.departments.length > 0 ? profile.departments.map(d => (
                  <span key={d.id} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">{d.name}</span>
                )) : <span className="text-gray-500">None</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Positions</label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {profile.positions.length > 0 ? profile.positions.map(p => (
                  <span key={p} className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400">{p}</span>
                )) : <span className="text-gray-500">None</span>}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Employment Type</label>
              <p className="mt-1 text-gray-300 capitalize">{profile.employmentType.replace("_", " ")}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Hire Date</label>
              <p className="mt-1 text-gray-300">{new Date(profile.hireDate).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Shield size={20} /> Emergency Contact
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Contact Name</label>
              {editMode ? (
                <input
                  type="text"
                  value={form.emergencyName}
                  onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary outline-none"
                  placeholder="Emergency contact name"
                />
              ) : (
                <p className="mt-1 text-gray-300">{profile.emergencyName || "Not set"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Contact Phone</label>
              {editMode ? (
                <input
                  type="text"
                  value={form.emergencyPhone}
                  onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary outline-none"
                  placeholder="Emergency contact phone"
                />
              ) : (
                <p className="mt-1 text-gray-300">{profile.emergencyPhone || "Not set"}</p>
              )}
            </div>
            <div>
              <label className="text-xs text-gray-500 uppercase tracking-wider">Relationship</label>
              {editMode ? (
                <input
                  type="text"
                  value={form.emergencyRelation}
                  onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-elvion-primary outline-none"
                  placeholder="e.g. Spouse, Parent, Sibling"
                />
              ) : (
                <p className="mt-1 text-gray-300">{profile.emergencyRelation || "Not set"}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
