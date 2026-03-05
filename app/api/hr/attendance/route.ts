import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET attendance records
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
    const date = searchParams.get('date');
    const month = searchParams.get('month'); // YYYY-MM
    const status = searchParams.get('status');

    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (status) where.status = status;
    if (date) {
      where.date = new Date(date);
    } else if (month) {
      const [year, m] = month.split('-').map(Number);
      where.date = {
        gte: new Date(year, m - 1, 1),
        lt: new Date(year, m, 1),
      };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true, position: true, department: { select: { name: true } } },
        },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(attendances);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST create/bulk attendance
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

    // Support single or bulk records
    if (Array.isArray(body)) {
      const records = body.map((r: any) => ({
        employeeId: parseInt(r.employeeId),
        date: new Date(r.date),
        clockIn: r.clockIn ? new Date(r.clockIn) : null,
        clockOut: r.clockOut ? new Date(r.clockOut) : null,
        status: r.status || 'present',
        hoursWorked: r.hoursWorked ? parseFloat(r.hoursWorked) : null,
        notes: r.notes,
      }));

      // Use upsert for each record
      const results = await Promise.all(
        records.map((r: any) =>
          prisma.attendance.upsert({
            where: { employeeId_date: { employeeId: r.employeeId, date: r.date } },
            create: r,
            update: r,
          })
        )
      );
      return NextResponse.json(results, { status: 201 });
    }

    const { employeeId, date, clockIn, clockOut, status, hoursWorked, notes } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ message: 'Employee ID and date are required' }, { status: 400 });
    }

    const attendance = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: parseInt(employeeId),
          date: new Date(date),
        },
      },
      create: {
        employeeId: parseInt(employeeId),
        date: new Date(date),
        clockIn: clockIn ? new Date(clockIn) : null,
        clockOut: clockOut ? new Date(clockOut) : null,
        status: status || 'present',
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
        notes,
      },
      update: {
        clockIn: clockIn ? new Date(clockIn) : null,
        clockOut: clockOut ? new Date(clockOut) : null,
        status: status || 'present',
        hoursWorked: hoursWorked ? parseFloat(hoursWorked) : null,
        notes,
      },
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error('Error creating attendance:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
