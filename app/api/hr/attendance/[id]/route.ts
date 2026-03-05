import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// DELETE attendance record
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }
    if (!isAdmin(result.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.attendance.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Attendance record deleted' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT update attendance record
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }
    if (!isAdmin(result.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const attendance = await prisma.attendance.update({
      where: { id: parseInt(id) },
      data: {
        clockIn: body.clockIn ? new Date(body.clockIn) : null,
        clockOut: body.clockOut ? new Date(body.clockOut) : null,
        status: body.status,
        hoursWorked: body.hoursWorked ? parseFloat(body.hoursWorked) : null,
        notes: body.notes,
      },
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error updating attendance:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
