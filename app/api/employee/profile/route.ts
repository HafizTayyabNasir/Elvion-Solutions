import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET employee profile
export async function GET(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: result.user.userId },
      include: {
        departments: { select: { id: true, name: true } },
      },
    });

    if (!employee) {
      return NextResponse.json({ message: 'No employee record found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error('Employee profile error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update limited profile fields
export async function PUT(request: Request) {
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

    const body = await request.json();

    // Employees can only update limited fields
    const allowedFields: Record<string, unknown> = {};
    if (body.phone !== undefined) allowedFields.phone = body.phone;
    if (body.address !== undefined) allowedFields.address = body.address;
    if (body.city !== undefined) allowedFields.city = body.city;
    if (body.country !== undefined) allowedFields.country = body.country;
    if (body.emergencyName !== undefined) allowedFields.emergencyName = body.emergencyName;
    if (body.emergencyPhone !== undefined) allowedFields.emergencyPhone = body.emergencyPhone;
    if (body.emergencyRelation !== undefined) allowedFields.emergencyRelation = body.emergencyRelation;

    const updated = await prisma.employee.update({
      where: { id: employee.id },
      data: allowedFields,
      include: {
        departments: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Employee profile update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
