import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET leave requests
export async function GET(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }
    if (!isAdmin(result.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (status) where.status = status;

    const leaveRequests = await prisma.leaveRequest.findMany({
      where,
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true, position: true, department: { select: { name: true } } },
        },
        leaveType: { select: { id: true, name: true, isPaid: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST create leave request
export async function POST(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }
    if (!isAdmin(result.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, leaveTypeId, startDate, endDate, totalDays, reason } = body;

    if (!employeeId || !leaveTypeId || !startDate || !endDate) {
      return NextResponse.json({ message: 'Employee, leave type, start date, and end date are required' }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = totalDays || Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId: parseInt(employeeId),
        leaveTypeId: parseInt(leaveTypeId),
        startDate: start,
        endDate: end,
        totalDays: days,
        reason,
      },
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true },
        },
        leaveType: { select: { name: true } },
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
