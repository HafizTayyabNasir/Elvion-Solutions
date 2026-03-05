import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET employee's payroll history
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
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const payrolls = await prisma.payroll.findMany({
      where: {
        employeeId: employee.id,
        year,
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    const totalEarnings = payrolls
      .filter((p: { status: string }) => p.status === 'paid')
      .reduce((sum: number, p: { netPay: number }) => sum + p.netPay, 0);

    const totalDeductions = payrolls
      .filter((p: { status: string }) => p.status === 'paid')
      .reduce((sum: number, p: { deductions: number; tax: number }) => sum + p.deductions + p.tax, 0);

    return NextResponse.json({
      payrolls,
      year,
      summary: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        monthsProcessed: payrolls.filter((p: { status: string }) => p.status !== 'draft').length,
      },
    });
  } catch (error) {
    console.error('Employee payroll error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
