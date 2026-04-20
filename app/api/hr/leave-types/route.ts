import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET all leave types
export async function GET(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const leaveTypes = await prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(leaveTypes);
  } catch (error) {
    console.error('Error fetching leave types:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST create leave type
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
    const { name, description, defaultDays, isPaid } = body;

    if (!name) {
      return NextResponse.json({ message: 'Leave type name is required' }, { status: 400 });
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        name,
        description,
        defaultDays: defaultDays ? parseInt(defaultDays) : 0,
        isPaid: isPaid !== false,
      },
    });

    return NextResponse.json(leaveType, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ message: 'Leave type already exists' }, { status: 409 });
    }
    console.error('Error creating leave type:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
