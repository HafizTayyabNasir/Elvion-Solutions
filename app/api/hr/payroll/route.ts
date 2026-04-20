import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET payroll records
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
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const status = searchParams.get('status');

    const where: any = {};
    if (employeeId) where.employeeId = parseInt(employeeId);
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    if (status) where.status = status;

    const payrolls = await prisma.payroll.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true, employeeId: true, firstName: true, lastName: true,
            positions: true, departments: { select: { name: true } },
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return NextResponse.json(payrolls);
  } catch (error) {
    console.error('Error fetching payrolls:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST create payroll / generate payroll for month
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

    // Bulk generate for all active employees
    if (body.generateAll) {
      const { month, year } = body;
      if (!month || !year) {
        return NextResponse.json({ message: 'Month and year are required' }, { status: 400 });
      }

      const employees = await prisma.employee.findMany({
        where: { status: 'active' },
        select: { id: true, salary: true, currency: true },
      });

      const payrolls = await Promise.all(
        employees.map((emp: { id: number; salary: number | null; currency: string }) =>
          prisma.payroll.upsert({
            where: {
              employeeId_month_year: {
                employeeId: emp.id,
                month: parseInt(month),
                year: parseInt(year),
              },
            },
            create: {
              employeeId: emp.id,
              month: parseInt(month),
              year: parseInt(year),
              baseSalary: emp.salary || 0,
              bonus: 0,
              deductions: 0,
              tax: 0,
              netPay: emp.salary || 0,
              currency: emp.currency,
              status: 'draft',
            },
            update: {},  // Don't overwrite existing
          })
        )
      );

      return NextResponse.json({ message: `Generated ${payrolls.length} payroll records`, count: payrolls.length }, { status: 201 });
    }

    // Single payroll record
    const { employeeId, month, year, baseSalary, bonus, deductions, tax, notes } = body;

    if (!employeeId || !month || !year) {
      return NextResponse.json({ message: 'Employee, month, and year are required' }, { status: 400 });
    }

    const base = parseFloat(baseSalary) || 0;
    const b = parseFloat(bonus) || 0;
    const d = parseFloat(deductions) || 0;
    const t = parseFloat(tax) || 0;
    const netPay = base + b - d - t;

    const payroll = await prisma.payroll.upsert({
      where: {
        employeeId_month_year: {
          employeeId: parseInt(employeeId),
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      create: {
        employeeId: parseInt(employeeId),
        month: parseInt(month),
        year: parseInt(year),
        baseSalary: base,
        bonus: b,
        deductions: d,
        tax: t,
        netPay,
        notes,
        status: 'draft',
      },
      update: {
        baseSalary: base,
        bonus: b,
        deductions: d,
        tax: t,
        netPay,
        notes,
      },
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(payroll, { status: 201 });
  } catch (error) {
    console.error('Error creating payroll:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
