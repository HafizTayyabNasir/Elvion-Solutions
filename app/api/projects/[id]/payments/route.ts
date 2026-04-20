import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET all payments for a project
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const projectId = parseInt(id);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const payments = await prisma.projectPayment.findMany({
      where: { projectId },
      orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching project payments:', error);
    return NextResponse.json({ message: 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST create a new payment entry
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const { amount, status, category, label, taskId, description, paymentDate, currency } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ message: 'Amount must be greater than 0' }, { status: 400 });
    }

    const payment = await prisma.projectPayment.create({
      data: {
        projectId,
        amount: parseFloat(amount),
        status: status || 'received',
        category: category || 'monthly',
        label: label || null,
        taskId: taskId ? parseInt(taskId) : null,
        description: description || null,
        currency: currency || 'USD',
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ message: 'Failed to create payment' }, { status: 500 });
  }
}
