import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// PUT update payroll
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

    const data: any = {};
    if (body.baseSalary !== undefined) data.baseSalary = parseFloat(body.baseSalary);
    if (body.bonus !== undefined) data.bonus = parseFloat(body.bonus);
    if (body.deductions !== undefined) data.deductions = parseFloat(body.deductions);
    if (body.tax !== undefined) data.tax = parseFloat(body.tax);
    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.paidDate !== undefined) data.paidDate = body.paidDate ? new Date(body.paidDate) : null;

    // Recalculate netPay
    const existing = await prisma.payroll.findUnique({ where: { id: parseInt(id) } });
    if (existing) {
      const base = data.baseSalary ?? existing.baseSalary;
      const bonus = data.bonus ?? existing.bonus;
      const deductions = data.deductions ?? existing.deductions;
      const tax = data.tax ?? existing.tax;
      data.netPay = base + bonus - deductions - tax;
    }

    if (body.status === 'paid' && !data.paidDate) {
      data.paidDate = new Date();
    }

    const payroll = await prisma.payroll.update({
      where: { id: parseInt(id) },
      data,
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json(payroll);
  } catch (error) {
    console.error('Error updating payroll:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE payroll
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
    await prisma.payroll.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Payroll record deleted' });
  } catch (error) {
    console.error('Error deleting payroll:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
