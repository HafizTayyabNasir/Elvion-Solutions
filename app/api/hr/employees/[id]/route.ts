import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET single employee
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }
    if (!isAdmin(result.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      include: {
        department: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
        attendances: { orderBy: { date: 'desc' }, take: 30 },
        leaveRequests: {
          include: { leaveType: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        payrolls: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 12 },
      },
    });

    if (!employee) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT update employee
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
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'gender',
      'address', 'city', 'country', 'position',
      'employmentType', 'status', 'currency',
      'emergencyName', 'emergencyPhone', 'emergencyRelation',
    ];

    fields.forEach((f: string) => { if (body[f] !== undefined) data[f] = body[f]; });
    if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    if (body.departmentId !== undefined) data.departmentId = body.departmentId ? parseInt(body.departmentId) : null;
    if (body.salary !== undefined) data.salary = body.salary ? parseFloat(body.salary) : null;
    if (body.hireDate !== undefined) data.hireDate = new Date(body.hireDate);
    if (body.terminationDate !== undefined) data.terminationDate = body.terminationDate ? new Date(body.terminationDate) : null;
    if (body.userId !== undefined) data.userId = body.userId ? parseInt(body.userId) : null;

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data,
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(employee);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
    }
    console.error('Error updating employee:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE employee
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
    await prisma.employee.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
