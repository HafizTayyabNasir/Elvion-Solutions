import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get single ticket with responses
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
    const ticketId = parseInt(id);

    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
        responses: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // Check access
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin && ticket.creatorId !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return NextResponse.json({ message: 'Failed to fetch ticket' }, { status: 500 });
  }
}

// Update ticket (status, assignee, etc.)
export async function PUT(
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
    const data = await request.json();

    const existingTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!existingTicket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    // Check access
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin && existingTicket.creatorId !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.status) updateData.status = data.status;
    if (data.priority) updateData.priority = data.priority;
    if (data.category) updateData.category = data.category;
    
    // Only admins can assign tickets
    if (user?.isAdmin && data.assigneeId !== undefined) {
      updateData.assigneeId = data.assigneeId ? parseInt(data.assigneeId) : null;
    }

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
      include: {
        creator: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'updated',
        entityType: 'ticket',
        entityId: ticket.id,
        description: `Updated ticket: ${ticket.subject}`,
        userId,
      },
    });

    // Notify ticket creator of status changes
    if (data.status && data.status !== existingTicket.status && existingTicket.creatorId !== userId) {
      await prisma.notification.create({
        data: {
          title: 'Ticket Status Updated',
          message: `Your ticket "${ticket.subject}" status changed to: ${data.status}`,
          type: 'info',
          link: `/customer/tickets/${ticket.id}`,
          userId: existingTicket.creatorId,
        },
      });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ message: 'Failed to update ticket' }, { status: 500 });
  }
}

// Delete ticket (admin only)
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
      return NextResponse.json({ message: 'Only admins can delete tickets' }, { status: 403 });
    }

    const { id } = await params;
    const ticketId = parseInt(id);

    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    await prisma.ticket.delete({ where: { id: ticketId } });

    return NextResponse.json({ message: 'Ticket deleted successfully' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ message: 'Failed to delete ticket' }, { status: 500 });
  }
}
