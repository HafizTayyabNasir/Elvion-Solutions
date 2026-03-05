import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET employee self-service dashboard data
export async function GET(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    // Find employee record linked to this user
    const employee = await prisma.employee.findUnique({
      where: { userId: result.user.userId },
      include: {
        departments: { select: { id: true, name: true } },
      },
    });

    if (!employee) {
      return NextResponse.json({ message: 'No employee record found for this user' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const firstOfYear = new Date(today.getFullYear(), 0, 1);

    const [
      todayAttendance,
      monthAttendance,
      pendingLeaves,
      approvedLeaves,
      yearLeaves,
      recentPayroll,
      leaveTypes,
      myTasks,
      myProjects,
    ] = await Promise.all([
      // Today's attendance
      prisma.attendance.findUnique({
        where: {
          employeeId_date: { employeeId: employee.id, date: today },
        },
      }),
      // This month's attendance
      prisma.attendance.findMany({
        where: {
          employeeId: employee.id,
          date: { gte: firstOfMonth, lt: firstOfNextMonth },
        },
        orderBy: { date: 'desc' },
      }),
      // Pending leave requests
      prisma.leaveRequest.count({
        where: { employeeId: employee.id, status: 'pending' },
      }),
      // Approved leaves this year
      prisma.leaveRequest.findMany({
        where: {
          employeeId: employee.id,
          status: 'approved',
          startDate: { gte: firstOfYear },
        },
        include: { leaveType: { select: { name: true } } },
      }),
      // All leave requests this year
      prisma.leaveRequest.findMany({
        where: {
          employeeId: employee.id,
          startDate: { gte: firstOfYear },
        },
        include: { leaveType: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      // Recent payroll records
      prisma.payroll.findMany({
        where: { employeeId: employee.id },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        take: 3,
      }),
      // Leave types with defaults
      prisma.leaveType.findMany({
        where: { isActive: true },
        select: { id: true, name: true, defaultDays: true },
      }),
      // Tasks assigned to or created by this employee
      employee.userId ? prisma.task.findMany({
        where: {
          OR: [
            { assigneeId: employee.userId },
            { creatorId: employee.userId },
          ],
        },
        include: {
          project: { select: { id: true, name: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }) : Promise.resolve([]),
      // Projects the employee is a member of
      employee.userId ? prisma.project.findMany({
        where: {
          OR: [
            { ownerId: employee.userId },
            { members: { some: { userId: employee.userId } } },
          ],
        },
        select: {
          id: true,
          name: true,
          status: true,
          progress: true,
          _count: { select: { tasks: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }) : Promise.resolve([]),
    ]);

    // Calculate attendance stats for this month
    const presentDays = monthAttendance.filter((a: { status: string }) => ['present', 'remote'].includes(a.status)).length;
    const lateDays = monthAttendance.filter((a: { status: string }) => a.status === 'late').length;
    const absentDays = monthAttendance.filter((a: { status: string }) => a.status === 'absent').length;
    const totalHours = monthAttendance.reduce((sum: number, a: { hoursWorked: number | null }) => sum + (a.hoursWorked || 0), 0);

    // Calculate leave balance per type
    const leaveBalance = leaveTypes.map((lt: { id: number; name: string; defaultDays: number }) => {
      const used = approvedLeaves
        .filter((l: { leaveType: { name: string }; totalDays: number }) => l.leaveType.name === lt.name)
        .reduce((sum: number, l: { totalDays: number }) => sum + l.totalDays, 0);
      return {
        type: lt.name,
        total: lt.defaultDays,
        used,
        remaining: lt.defaultDays - used,
      };
    });

    const totalLeaveUsed = approvedLeaves.reduce((sum: number, l: { totalDays: number }) => sum + l.totalDays, 0);

    // Task summary
    const taskSummary = {
      total: myTasks.length,
      todo: myTasks.filter((t: { status: string }) => t.status === 'todo').length,
      inProgress: myTasks.filter((t: { status: string }) => t.status === 'in_progress').length,
      review: myTasks.filter((t: { status: string }) => t.status === 'review').length,
      done: myTasks.filter((t: { status: string }) => t.status === 'done').length,
      overdue: myTasks.filter((t: { status: string; dueDate: Date | null }) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    };

    // Recent tasks (top 5 non-done)
    const recentTasks = myTasks
      .filter((t: { status: string }) => t.status !== 'done')
      .slice(0, 5)
      .map((t: { id: number; title: string; status: string; priority: string; dueDate: Date | null; project: { id: number; name: string } | null }) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        project: t.project,
      }));

    // Project summary
    const projectSummary = {
      total: myProjects.length,
      active: myProjects.filter((p: { status: string }) => p.status === 'active').length,
      completed: myProjects.filter((p: { status: string }) => p.status === 'completed').length,
    };

    return NextResponse.json({
      employee: {
        id: employee.id,
        employeeId: employee.employeeId,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        avatar: employee.avatar,
        departments: employee.departments,
        positions: employee.positions,
        employmentType: employee.employmentType,
        status: employee.status,
        hireDate: employee.hireDate,
      },
      attendance: {
        today: todayAttendance,
        monthStats: {
          present: presentDays,
          late: lateDays,
          absent: absentDays,
          totalHours: Math.round(totalHours * 10) / 10,
          totalDays: monthAttendance.length,
        },
      },
      leaves: {
        pending: pendingLeaves,
        totalUsed: totalLeaveUsed,
        balance: leaveBalance,
        recent: yearLeaves,
      },
      payroll: recentPayroll,
      tasks: {
        summary: taskSummary,
        recent: recentTasks,
      },
      projects: {
        summary: projectSummary,
        list: myProjects.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
