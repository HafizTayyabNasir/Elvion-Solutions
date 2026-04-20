import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Add response to ticket
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ticketId = parseInt(id);
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // Check access
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin && ticket.creatorId !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const response = await prisma.ticketResponse.create({
      data: {
        message,
        isStaff: user?.isAdmin || false,
        ticketId,
      },
    });

    // Update ticket status if it's a staff response and was open
    if (user?.isAdmin && ticket.status === 'open') {
      await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: 'in_progress' },
      });
    }

    // Notify the other party
    const notifyUserId = user?.isAdmin ? ticket.creatorId : (ticket.assigneeId || null);
    if (notifyUserId) {
      await prisma.notification.create({
        data: {
          title: 'New Response on Ticket',
          message: `New response on: ${ticket.subject}`,
          type: 'info',
          link: user?.isAdmin ? `/customer/tickets/${ticketId}` : `/admin/tickets/${ticketId}`,
          userId: notifyUserId,
        },
      });
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error adding response:', error);
    return NextResponse.json({ message: 'Failed to add response' }, { status: 500 });
  }
}
