"use client";
import { useState, useEffect } from "react";
import {
  Users, Building2, Clock, CalendarCheck, DollarSign, UserPlus,
  TrendingUp, Briefcase, ArrowRight, AlertCircle, UserCheck
} from "lucide-react";
import Link from "next/link";
import { fetchAPI } from "@/lib/api";

interface HRStats {
  totalEmployees: number;
  activeEmployees: number;
  departments: number;
  pendingLeaves: number;
  todayAttendance: number;
  attendanceBreakdown: { present: number; absent: number; late: number; remote: number; halfDay: number };
  recentHires: Array<{
    id: number; employeeId: string; firstName: string; lastName: string;
    position: string; hireDate: string; department: { name: string } | null;
  }>;
  departmentStats: Array<{ name: string; employees: number }>;
  employmentTypeStats: Array<{ type: string; count: number }>;
  monthlyPayrollTotal: number;
}

const employmentTypeLabels: Record<string, string> = {
  full_time: "Full Time",
  part_time: "Part Time",
  contract: "Contract",
  intern: "Intern",
};

export default function HRDashboard() {
  const [stats, setStats] = useState<HRStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAPI("/hr/dashboard")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-elvion-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-red-400 py-12">Failed to load HR dashboard data.</div>;
  }

  const statCards = [
    { label: "Total Employees", value: stats.totalEmployees, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Active Employees", value: stats.activeEmployees, icon: UserCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Departments", value: stats.departments, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Today's Attendance", value: stats.todayAttendance, icon: Clock, color: "text-cyan-400", bg: "bg-cyan-500/10" },
    { label: "Pending Leaves", value: stats.pendingLeaves, icon: CalendarCheck, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Monthly Payroll", value: `$${stats.monthlyPayrollTotal.toLocaleString()}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">HR Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your workforce effectively</p>
        </div>
        <Link href="/admin/hr/employees" className="flex items-center gap-2 px-4 py-2 bg-elvion-primary text-black rounded-lg font-medium hover:bg-elvion-primary/90 transition text-sm">
          <UserPlus size={16} /> Add Employee
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-elvion-card border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon size={18} className={card.color} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Distribution */}
        <div className="bg-elvion-card border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Department Distribution</h2>
            <Link href="/admin/hr/departments" className="text-elvion-primary text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {stats.departmentStats.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No departments created yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.departmentStats.map((dept) => {
                const maxEmployees = Math.max(...stats.departmentStats.map(d => d.employees), 1);
                const percentage = (dept.employees / maxEmployees) * 100;
                return (
                  <div key={dept.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{dept.name}</span>
                      <span className="text-gray-400">{dept.employees} employees</span>
                    </div>
                    <div className="w-full bg-elvion-dark rounded-full h-2">
                      <div className="bg-elvion-primary rounded-full h-2 transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Attendance Overview */}
        <div className="bg-elvion-card border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Monthly Attendance</h2>
            <Link href="/admin/hr/attendance" className="text-elvion-primary text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {[
              { label: "Present", value: stats.attendanceBreakdown.present, color: "text-green-400 bg-green-500/10" },
              { label: "Absent", value: stats.attendanceBreakdown.absent, color: "text-red-400 bg-red-500/10" },
              { label: "Late", value: stats.attendanceBreakdown.late, color: "text-yellow-400 bg-yellow-500/10" },
              { label: "Remote", value: stats.attendanceBreakdown.remote, color: "text-blue-400 bg-blue-500/10" },
              { label: "Half Day", value: stats.attendanceBreakdown.halfDay, color: "text-purple-400 bg-purple-500/10" },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg p-3 text-center ${item.color.split(' ')[1]}`}>
                <p className={`text-xl font-bold ${item.color.split(' ')[0]}`}>{item.value}</p>
                <p className="text-xs text-gray-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Employment Type */}
        <div className="bg-elvion-card border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Employment Types</h2>
          {stats.employmentTypeStats.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No employees yet.</p>
          ) : (
            <div className="space-y-3">
              {stats.employmentTypeStats.map((item) => (
                <div key={item.type} className="flex items-center justify-between p-3 bg-elvion-dark rounded-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm">{employmentTypeLabels[item.type] || item.type}</span>
                  </div>
                  <span className="text-white font-semibold">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Hires */}
        <div className="bg-elvion-card border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Hires</h2>
            <Link href="/admin/hr/employees" className="text-elvion-primary text-sm hover:underline flex items-center gap-1">
              View All <ArrowRight size={14} />
            </Link>
          </div>
          {stats.recentHires.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">No recent hires.</p>
          ) : (
            <div className="space-y-3">
              {stats.recentHires.map((emp) => (
                <div key={emp.id} className="flex items-center gap-3 p-3 bg-elvion-dark rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-elvion-primary/20 flex items-center justify-center text-elvion-primary font-bold text-sm">
                    {emp.firstName[0]}{emp.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-gray-400 truncate">{emp.position || "N/A"} • {emp.department?.name || "Unassigned"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(emp.hireDate).toLocaleDateString()}</p>
                    <span className="text-xs text-elvion-primary">{emp.employeeId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Manage Employees", href: "/admin/hr/employees", icon: Users, desc: "Add, edit, view employees" },
          { label: "Departments", href: "/admin/hr/departments", icon: Building2, desc: "Organize teams" },
          { label: "Leave Management", href: "/admin/hr/leaves", icon: CalendarCheck, desc: "Approve/reject leaves" },
          { label: "Payroll", href: "/admin/hr/payroll", icon: DollarSign, desc: "Process salaries" },
        ].map((link) => (
          <Link key={link.href} href={link.href} className="bg-elvion-card border border-white/10 rounded-xl p-5 hover:border-elvion-primary/30 transition group">
            <link.icon size={24} className="text-elvion-primary mb-3 group-hover:scale-110 transition" />
            <h3 className="text-white font-medium text-sm">{link.label}</h3>
            <p className="text-gray-500 text-xs mt-1">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
