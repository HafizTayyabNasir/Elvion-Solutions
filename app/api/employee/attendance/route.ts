import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET employee's attendance history
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
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const firstOfNextMonth = new Date(Date.UTC(year, month, 1));

    const attendance = await prisma.attendance.findMany({
      where: {
        employeeId: employee.id,
        date: { gte: firstOfMonth, lt: firstOfNextMonth },
      },
      orderBy: { date: 'desc' },
    });

    const stats = {
      present: attendance.filter((a: { status: string }) => a.status === 'present').length,
      absent: attendance.filter((a: { status: string }) => a.status === 'absent').length,
      late: attendance.filter((a: { status: string }) => a.status === 'late').length,
      remote: attendance.filter((a: { status: string }) => a.status === 'remote').length,
      halfDay: attendance.filter((a: { status: string }) => a.status === 'half_day').length,
      totalHours: Math.round(attendance.reduce((sum: number, a: { hoursWorked: number | null }) => sum + (a.hoursWorked || 0), 0) * 10) / 10,
    };

    return NextResponse.json({ attendance, stats, month, year });
  } catch (error) {
    console.error('Employee attendance error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST - Clock in/out
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

    const { action } = await request.json();
    const now = new Date();
    const today = new Date(now);
    today.setUTCHours(0, 0, 0, 0);

    if (action === 'clock_in') {
      // Check if already clocked in today
      const existing = await prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId: employee.id, date: today } },
      });

      if (existing) {
        return NextResponse.json({ message: 'Already clocked in today' }, { status: 400 });
      }

      // Determine status — late if clock-in is after the configured office start time
      const startSetting = await prisma.setting.findUnique({ where: { key: 'office_start_time' } });
      const [startH, startM] = (startSetting?.value || '09:00').split(':').map(Number);
      const isLate = now.getHours() > startH || (now.getHours() === startH && now.getMinutes() > startM);

      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: today,
          clockIn: now,
          status: isLate ? 'late' : 'present',
        },
      });

      return NextResponse.json(attendance, { status: 201 });
    } else if (action === 'clock_out') {
      const existing = await prisma.attendance.findUnique({
        where: { employeeId_date: { employeeId: employee.id, date: today } },
      });

      if (!existing) {
        return NextResponse.json({ message: 'No clock-in record for today' }, { status: 400 });
      }

      if (existing.clockOut) {
        return NextResponse.json({ message: 'Already clocked out today' }, { status: 400 });
      }

      const hoursWorked = existing.clockIn
        ? Math.round(((now.getTime() - existing.clockIn.getTime()) / (1000 * 60 * 60)) * 10) / 10
        : 0;

      const attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          clockOut: now,
          hoursWorked,
        },
      });

      return NextResponse.json(attendance);
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Employee clock error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
