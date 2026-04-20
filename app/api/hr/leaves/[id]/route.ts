import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// PUT update leave request (approve/reject)
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

    const leaveRequest = await prisma.leaveRequest.update({
      where: { id: parseInt(id) },
      data: {
        status: body.status,
        approvedBy: result.user.userId,
        approvalNote: body.approvalNote,
      },
      include: {
        employee: {
          select: { id: true, employeeId: true, firstName: true, lastName: true },
        },
        leaveType: { select: { name: true } },
      },
    });

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.error('Error updating leave request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE leave request
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
    await prisma.leaveRequest.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ message: 'Leave request deleted' });
  } catch (error) {
    console.error('Error deleting leave request:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
