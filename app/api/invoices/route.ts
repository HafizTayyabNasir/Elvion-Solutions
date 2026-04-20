import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get invoices
export async function GET(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    let invoices;
    if (user?.isAdmin) {
      invoices = await prisma.invoice.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          project: { select: { id: true, name: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      invoices = await prisma.invoice.findMany({
        where: { userId },
        include: {
          project: { select: { id: true, name: true } },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ message: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// Create invoice (admin only)
export async function POST(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Only admins can create invoices' }, { status: 403 });
    }

    const { clientId, projectId, dueDate, items, notes, currency, tax } = await request.json();

    if (!clientId || !items || items.length === 0) {
      return NextResponse.json({ message: 'Client and items are required' }, { status: 400 });
    }

    // Generate invoice number
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { id: 'desc' },
      select: { number: true },
    });
    const nextNumber = lastInvoice 
      ? `INV-${String(parseInt(lastInvoice.number.split('-')[1] || '0') + 1).padStart(5, '0')}`
      : 'INV-00001';

    // Calculate totals
    const subtotal = items.reduce((sum: number, item: { quantity: number; unitPrice: number }) => 
      sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * ((tax || 0) / 100);
    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        number: nextNumber,
        status: 'draft',
        dueDate: dueDate ? new Date(dueDate) : null,
        subtotal,
        tax: taxAmount,
        total,
        currency: currency || 'USD',
        notes,
        userId: parseInt(clientId),
        projectId: projectId ? parseInt(projectId) : null,
        items: {
          create: items.map((item: { description: string; quantity: number; unitPrice: number }) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        items: true,
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'created',
        entityType: 'invoice',
        entityId: invoice.id,
        description: `Created invoice: ${nextNumber}`,
        userId,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ message: 'Failed to create invoice' }, { status: 500 });
  }
}
