import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET all departments
export async function GET(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }
    if (!isAdmin(result.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const departments = await prisma.department.findMany({
      include: {
        _count: { select: { employees: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST create department
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
    const { name, description, managerId, budget } = body;

    if (!name) {
      return NextResponse.json({ message: 'Department name is required' }, { status: 400 });
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        managerId: managerId ? parseInt(managerId) : null,
        budget: budget ? parseFloat(budget) : null,
      },
      include: {
        _count: { select: { employees: true } },
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ message: 'Department name already exists' }, { status: 409 });
    }
    console.error('Error creating department:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
