import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PUT update a payment
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { paymentId } = await params;
    const data = await request.json();

    const payment = await prisma.projectPayment.update({
      where: { id: parseInt(paymentId) },
      data: {
        amount: data.amount ? parseFloat(data.amount) : undefined,
        status: data.status,
        category: data.category,
        label: data.label,
        taskId: data.taskId ? parseInt(data.taskId) : null,
        description: data.description,
        currency: data.currency || undefined,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : undefined,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ message: 'Failed to update payment' }, { status: 500 });
  }
}

// DELETE a payment
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; paymentId: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { paymentId } = await params;
    await prisma.projectPayment.delete({ where: { id: parseInt(paymentId) } });

    return NextResponse.json({ message: 'Payment deleted' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json({ message: 'Failed to delete payment' }, { status: 500 });
  }
}
