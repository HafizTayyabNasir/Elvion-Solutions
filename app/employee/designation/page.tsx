"use client";
import { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Award,
  Shield,
  BadgeCheck,
  Users,
} from "lucide-react";

interface DesignationData {
  employee: {
    id: number;
    employeeId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    departments: { id: number; name: string; description: string | null }[];
    positions: string[];
    employmentType: string;
    status: string;
    hireDate: string;
    city: string | null;
    country: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    salary: number | null;
    currency: string;
  };
}

const typeLabels: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  intern: "Intern",
};

const statusColors: Record<string, string> = {
  active: "bg-green-500/20 text-green-400",
  on_leave: "bg-yellow-500/20 text-yellow-400",
  terminated: "bg-red-500/20 text-red-400",
  resigned: "bg-gray-500/20 text-gray-400",
};

export default function EmployeeDesignationPage() {
  const [data, setData] = useState<DesignationData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/employee/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load");
      const profile = await res.json();
      setData({ employee: profile });
    } catch {
      console.error("Failed to load designation data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
        <h3 className="text-lg text-white">Unable to load designation info</h3>
      </div>
    );
  }

  const { employee } = data;
  const tenure = Math.floor((Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  const tenureMonths = Math.floor(((Date.now() - new Date(employee.hireDate).getTime()) / (1000 * 60 * 60 * 24 * 30.44)) % 12);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">My Designation</h1>
        <p className="text-gray-400 text-sm mt-1">Your role, department, and employment details</p>
      </div>

      {/* Profile Card */}
      <div className="bg-elvion-card rounded-xl border border-white/10 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-2xl shrink-0">
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{employee.firstName} {employee.lastName}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {employee.positions.map(p => (
                <span key={p} className="text-sm px-3 py-1 rounded-full bg-elvion-primary/10 text-elvion-primary border border-elvion-primary/20">
                  {p}
                </span>
              ))}
              {employee.positions.length === 0 && (
                <span className="text-sm text-gray-500">No position assigned</span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1"><Mail size={14} />{employee.email}</span>
              {employee.phone && <span className="flex items-center gap-1"><Phone size={14} />{employee.phone}</span>}
              {(employee.city || employee.country) && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />{[employee.city, employee.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            <span className={`text-xs px-3 py-1 rounded-full ${statusColors[employee.status] || "bg-gray-500/20 text-gray-400"}`}>
              {employee.status.replace("_", " ")}
            </span>
            <span className="text-xs text-gray-500">ID: {employee.employeeId}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Positions */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-5 border-b border-white/10 flex items-center gap-2">
            <Award size={18} className="text-elvion-primary" />
            <h2 className="text-lg font-semibold text-white">Positions & Roles</h2>
          </div>
          <div className="p-5">
            {employee.positions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No positions assigned</p>
            ) : (
              <div className="space-y-3">
                {employee.positions.map((pos, idx) => (
                  <div key={pos} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-lg bg-elvion-primary/10 flex items-center justify-center">
                      <BadgeCheck size={20} className="text-elvion-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{pos}</p>
                      <p className="text-xs text-gray-500">{idx === 0 ? "Primary Role" : "Additional Role"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Departments */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-5 border-b border-white/10 flex items-center gap-2">
            <Building2 size={18} className="text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Departments</h2>
          </div>
          <div className="p-5">
            {employee.departments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No department assigned</p>
            ) : (
              <div className="space-y-3">
                {employee.departments.map(dept => (
                  <div key={dept.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Users size={20} className="text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{dept.name}</p>
                      {dept.description && <p className="text-xs text-gray-500 line-clamp-1">{dept.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-5 border-b border-white/10 flex items-center gap-2">
            <Briefcase size={18} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Employment Details</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Employment Type</p>
                <p className="text-sm font-medium text-white">{typeLabels[employee.employmentType] || employee.employmentType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Employee Status</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[employee.status] || "bg-gray-500/20 text-gray-400"}`}>
                  {employee.status.replace("_", " ")}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Hire Date</p>
                <p className="text-sm text-white flex items-center gap-1">
                  <Calendar size={13} className="text-gray-500" />
                  {new Date(employee.hireDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tenure</p>
                <p className="text-sm text-white flex items-center gap-1">
                  <Clock size={13} className="text-gray-500" />
                  {tenure > 0 ? `${tenure} year${tenure > 1 ? "s" : ""}` : ""}{tenure > 0 && tenureMonths > 0 ? ", " : ""}{tenureMonths > 0 ? `${tenureMonths} month${tenureMonths > 1 ? "s" : ""}` : ""}{tenure === 0 && tenureMonths === 0 ? "< 1 month" : ""}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Info Card */}
        <div className="bg-elvion-card rounded-xl border border-white/10">
          <div className="p-5 border-b border-white/10 flex items-center gap-2">
            <User size={18} className="text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Personal Information</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Full Name</p>
                <p className="text-sm text-white">{employee.firstName} {employee.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Gender</p>
                <p className="text-sm text-white capitalize">{employee.gender || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Date of Birth</p>
                <p className="text-sm text-white">
                  {employee.dateOfBirth
                    ? new Date(employee.dateOfBirth).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
                    : "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-sm text-white">{employee.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
