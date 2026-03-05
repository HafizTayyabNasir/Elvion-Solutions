import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
        departments: { select: { id: true, name: true } },
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

    // Handle login credentials
    const { loginEmail, loginPassword, removeCredentials } = body;
    const employeeRecord = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true },
    });

    if (!employeeRecord) {
      return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
    }

    let newUserId: number | null | undefined = undefined; // undefined = don't change

    if (removeCredentials && employeeRecord.userId) {
      // Unlink and delete the user account
      await prisma.employee.update({
        where: { id: parseInt(id) },
        data: { userId: null },
      });
      await prisma.user.delete({ where: { id: employeeRecord.userId } });
      newUserId = null;
    } else if (loginEmail) {
      if (employeeRecord.userId) {
        // Update existing linked user
        const updateData: Record<string, unknown> = { email: loginEmail, isVerified: true };
        if (loginPassword && loginPassword.length >= 6) {
          updateData.password = await bcrypt.hash(loginPassword, 10);
        }
        if (body.firstName || body.lastName) {
          const emp = await prisma.employee.findUnique({ where: { id: parseInt(id) }, select: { firstName: true, lastName: true } });
          updateData.name = `${body.firstName || emp?.firstName} ${body.lastName || emp?.lastName}`;
        }
        try {
          await prisma.user.update({
            where: { id: employeeRecord.userId },
            data: updateData,
          });
        } catch (err: unknown) {
          const prismaErr = err as { code?: string };
          if (prismaErr?.code === 'P2002') {
            return NextResponse.json({ message: 'A user with this login email already exists' }, { status: 409 });
          }
          throw err;
        }
      } else {
        // Create new user account for this employee
        if (!loginPassword || loginPassword.length < 6) {
          return NextResponse.json({ message: 'Password (min 6 chars) is required when adding login credentials' }, { status: 400 });
        }
        const existingUser = await prisma.user.findUnique({ where: { email: loginEmail } });
        if (existingUser) {
          return NextResponse.json({ message: `A user account with email ${loginEmail} already exists` }, { status: 409 });
        }
        const emp = await prisma.employee.findUnique({ where: { id: parseInt(id) }, select: { firstName: true, lastName: true } });
        const hashedPassword = await bcrypt.hash(loginPassword, 10);
        const newUser = await prisma.user.create({
          data: {
            email: loginEmail,
            name: `${body.firstName || emp?.firstName} ${body.lastName || emp?.lastName}`,
            password: hashedPassword,
            isVerified: true,
            isAdmin: false,
          },
        });
        newUserId = newUser.id;
      }
    }

    const data: any = {};
    const fields = [
      'firstName', 'lastName', 'email', 'phone', 'gender',
      'address', 'city', 'country',
      'employmentType', 'status', 'currency',
      'emergencyName', 'emergencyPhone', 'emergencyRelation',
    ];

    fields.forEach((f: string) => { if (body[f] !== undefined) data[f] = body[f]; });
    if (body.positions !== undefined) data.positions = body.positions || [];
    if (body.departmentIds !== undefined) {
      data.departments = {
        set: (body.departmentIds || []).map((id: number) => ({ id: Number(id) })),
      };
    }
    if (body.dateOfBirth !== undefined) data.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    if (body.salary !== undefined) data.salary = body.salary ? parseFloat(body.salary) : null;
    if (body.hireDate !== undefined) data.hireDate = new Date(body.hireDate);
    if (body.terminationDate !== undefined) data.terminationDate = body.terminationDate ? new Date(body.terminationDate) : null;
    if (newUserId !== undefined) data.userId = newUserId;
    else if (body.userId !== undefined && !loginEmail && !removeCredentials) data.userId = body.userId ? parseInt(body.userId) : null;

    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data,
      include: {
        departments: { select: { id: true, name: true } },
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
    
    // Get employee to check for linked user
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true },
    });

    await prisma.employee.delete({ where: { id: parseInt(id) } });

    // Also delete the linked user account if one exists
    if (employee?.userId) {
      await prisma.user.delete({ where: { id: employee.userId } }).catch(() => {
        // User may already be deleted or have other references
      });
    }

    return NextResponse.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
