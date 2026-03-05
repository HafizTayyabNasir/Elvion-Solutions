import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET all employees
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
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = {};
    if (departmentId) where.departmentId = parseInt(departmentId);
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
      ];
    }

    const employees = await prisma.employee.findMany({
      where,
      include: {
        department: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST create employee
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
    const {
      firstName, lastName, email, phone, dateOfBirth, gender,
      address, city, country, departmentId, position,
      employmentType, salary, currency, hireDate,
      emergencyName, emergencyPhone, emergencyRelation, userId,
    } = body;

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ message: 'First name, last name, and email are required' }, { status: 400 });
    }

    // Generate employee ID
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true },
    });
    const nextNum = (lastEmployee?.id || 0) + 1;
    const employeeId = `ELV-${String(nextNum).padStart(3, '0')}`;

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        address,
        city,
        country,
        departmentId: departmentId ? parseInt(departmentId) : null,
        position,
        employmentType: employmentType || 'full_time',
        salary: salary ? parseFloat(salary) : null,
        currency: currency || 'USD',
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        emergencyName,
        emergencyPhone,
        emergencyRelation,
        userId: userId ? parseInt(userId) : null,
      },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error: any) {
    if (error?.code === 'P2002') {
      const field = error.meta?.target?.[0];
      return NextResponse.json({ message: `${field === 'email' ? 'Email' : 'Employee ID'} already exists` }, { status: 409 });
    }
    console.error('Error creating employee:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
