import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

// Get single invoice
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const invoiceId = parseInt(id);

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        user: { select: { id: true, name: true, email: true, company: true, phone: true } },
        project: { select: { id: true, name: true } },
        items: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    // Check access
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin && invoice.userId !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ message: 'Failed to fetch invoice' }, { status: 500 });
  }
}

// Update invoice
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Only admins can update invoices' }, { status: 403 });
    }

    const { id } = await params;
    const invoiceId = parseInt(id);
    const data = await request.json();

    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { user: true },
    });
    if (!existingInvoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        notes: data.notes,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        items: true,
      },
    });

    // Send email notification if invoice is being sent
    if (data.status === 'sent' && existingInvoice.status === 'draft') {
      try {
        await sendEmail(
          existingInvoice.user.email,
          `Invoice ${invoice.number} from Elvion Solutions`,
          `You have received a new invoice. Amount: ${invoice.currency} ${invoice.total.toFixed(2)}`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 30px; border-radius: 10px;">
              <h1 style="color: #00D28D; text-align: center;">Elvion Solutions</h1>
              <div style="background: #fff; padding: 30px; border-radius: 8px;">
                <h2>Invoice ${invoice.number}</h2>
                <p>Dear ${existingInvoice.user.name || 'Customer'},</p>
                <p>You have received a new invoice from Elvion Solutions.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr><td>Invoice Number:</td><td><strong>${invoice.number}</strong></td></tr>
                  <tr><td>Amount:</td><td><strong>${invoice.currency} ${invoice.total.toFixed(2)}</strong></td></tr>
                  ${invoice.dueDate ? `<tr><td>Due Date:</td><td><strong>${new Date(invoice.dueDate).toLocaleDateString()}</strong></td></tr>` : ''}
                </table>
                <p>Please login to your customer portal to view the full invoice and make payment.</p>
              </div>
            </div>
          </div>
          `
        );
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
      }

      // Create notification
      await prisma.notification.create({
        data: {
          title: 'New Invoice',
          message: `Invoice ${invoice.number} for ${invoice.currency} ${invoice.total.toFixed(2)}`,
          type: 'info',
          link: `/customer/invoices/${invoice.id}`,
          userId: invoice.userId,
        },
      });
    }

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'updated',
        entityType: 'invoice',
        entityId: invoice.id,
        description: `Updated invoice: ${invoice.number} - Status: ${data.status}`,
        userId,
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ message: 'Failed to update invoice' }, { status: 500 });
  }
}

// Delete invoice
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Only admins can delete invoices' }, { status: 403 });
    }

    const { id } = await params;
    const invoiceId = parseInt(id);

    await prisma.invoice.delete({ where: { id: invoiceId } });

    return NextResponse.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ message: 'Failed to delete invoice' }, { status: 500 });
  }
}
