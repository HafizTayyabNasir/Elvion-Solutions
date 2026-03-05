import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET single department
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
    const department = await prisma.department.findUnique({
      where: { id: parseInt(id) },
      include: {
        employees: {
          select: { id: true, employeeId: true, firstName: true, lastName: true, position: true, status: true },
        },
        _count: { select: { employees: true } },
      },
    });

    if (!department) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT update department
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

    const department = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name: body.name,
        description: body.description,
        managerId: body.managerId ? parseInt(body.managerId) : null,
        budget: body.budget ? parseFloat(body.budget) : null,
        isActive: body.isActive,
      },
      include: {
        _count: { select: { employees: true } },
      },
    });

    return NextResponse.json(department);
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ message: 'Department name already exists' }, { status: 409 });
    }
    console.error('Error updating department:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE department
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

    // Check for employees in department
    const employeeCount = await prisma.employee.count({ where: { departmentId: parseInt(id) } });
    if (employeeCount > 0) {
      return NextResponse.json(
        { message: `Cannot delete department with ${employeeCount} employees. Reassign them first.` },
        { status: 400 }
      );
    }

    await prisma.department.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
