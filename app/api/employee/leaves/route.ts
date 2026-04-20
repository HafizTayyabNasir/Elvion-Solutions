import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET employee's leave requests
export async function GET(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: result.user.userId },
    });

    if (!employee) {
      return NextResponse.json({ message: 'No employee record found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const firstOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const where: Record<string, unknown> = {
      employeeId: employee.id,
      startDate: { gte: firstOfYear, lt: endOfYear },
    };
    if (status) where.status = status;

    const [leaves, leaveTypes] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: { leaveType: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveType.findMany({
        where: { isActive: true },
      }),
    ]);

    // Calculate balance
    const approvedLeaves = leaves.filter((l: { status: string }) => l.status === 'approved');
    const balance = leaveTypes.map((lt: { id: number; name: string; defaultDays: number }) => {
      const used = approvedLeaves
        .filter((l: { leaveType: { name: string }; totalDays: number }) => l.leaveType.name === lt.name)
        .reduce((sum: number, l: { totalDays: number }) => sum + l.totalDays, 0);
      return {
        typeId: lt.id,
        type: lt.name,
        total: lt.defaultDays,
        used,
        remaining: lt.defaultDays - used,
      };
    });

    return NextResponse.json({ leaves, balance, leaveTypes, year });
  } catch (error) {
    console.error('Employee leaves error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST - Request a new leave
export async function POST(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: result.user.userId },
    });

    if (!employee) {
      return NextResponse.json({ message: 'No employee record found' }, { status: 404 });
    }

    const { leaveTypeId, startDate, endDate, reason } = await request.json();

    if (!leaveTypeId || !startDate || !endDate) {
      return NextResponse.json({ message: 'Leave type, start date, and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      return NextResponse.json({ message: 'End date must be after start date' }, { status: 400 });
    }

    // Calculate total days (excluding weekends)
    let totalDays = 0;
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day !== 0 && day !== 6) totalDays++;
      current.setDate(current.getDate() + 1);
    }

    // Check balance
    const leaveType = await prisma.leaveType.findUnique({ where: { id: leaveTypeId } });
    if (!leaveType) {
      return NextResponse.json({ message: 'Invalid leave type' }, { status: 400 });
    }

    const usedDays = await prisma.leaveRequest.aggregate({
      where: {
        employeeId: employee.id,
        leaveTypeId,
        status: 'approved',
        startDate: { gte: new Date(new Date().getFullYear(), 0, 1) },
      },
      _sum: { totalDays: true },
    });

    const remaining = leaveType.defaultDays - (usedDays._sum.totalDays || 0);
    if (totalDays > remaining) {
      return NextResponse.json({ message: `Insufficient leave balance. ${remaining} days remaining.` }, { status: 400 });
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        employeeId: employee.id,
        leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays,
        reason: reason || null,
      },
      include: { leaveType: { select: { name: true } } },
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error('Employee leave request error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
