import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET HR dashboard stats
export async function GET(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }
    if (!isAdmin(result.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const [
      totalEmployees,
      activeEmployees,
      departments,
      pendingLeaves,
      todayAttendance,
      monthAttendance,
      recentHires,
      departmentStats,
      employmentTypeStats,
      monthlyPayroll,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: 'active' } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.leaveRequest.count({ where: { status: 'pending' } }),
      prisma.attendance.count({
        where: { date: today, status: { in: ['present', 'late', 'remote'] } },
      }),
      prisma.attendance.findMany({
        where: {
          date: { gte: firstOfMonth, lt: firstOfNextMonth },
        },
        select: { status: true },
      }),
      prisma.employee.findMany({
        where: { hireDate: { gte: new Date(today.getFullYear(), today.getMonth() - 3, 1) } },
        select: { id: true, employeeId: true, firstName: true, lastName: true, position: true, hireDate: true, department: { select: { name: true } } },
        orderBy: { hireDate: 'desc' },
        take: 5,
      }),
      prisma.department.findMany({
        where: { isActive: true },
        select: { name: true, _count: { select: { employees: true } } },
        orderBy: { name: 'asc' },
      }),
      prisma.employee.groupBy({
        by: ['employmentType'],
        _count: true,
        where: { status: 'active' },
      }),
      prisma.payroll.aggregate({
        where: {
          month: today.getMonth() + 1,
          year: today.getFullYear(),
          status: { in: ['processed', 'paid'] },
        },
        _sum: { netPay: true },
      }),
    ]);

    // Attendance breakdown this month
    const attendanceBreakdown = {
      present: monthAttendance.filter(a => a.status === 'present').length,
      absent: monthAttendance.filter(a => a.status === 'absent').length,
      late: monthAttendance.filter(a => a.status === 'late').length,
      remote: monthAttendance.filter(a => a.status === 'remote').length,
      halfDay: monthAttendance.filter(a => a.status === 'half_day').length,
    };

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      departments,
      pendingLeaves,
      todayAttendance,
      attendanceBreakdown,
      recentHires,
      departmentStats: departmentStats.map(d => ({ name: d.name, employees: d._count.employees })),
      employmentTypeStats: employmentTypeStats.map(e => ({ type: e.employmentType, count: e._count })),
      monthlyPayrollTotal: monthlyPayroll._sum.netPay || 0,
    });
  } catch (error) {
    console.error('Error fetching HR stats:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
