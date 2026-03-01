import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get all tickets
export async function GET(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    let tickets;
    if (user?.isAdmin) {
      // Admins see all tickets
      tickets = await prisma.ticket.findMany({
        include: {
          creator: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
          _count: { select: { responses: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Users see only their tickets
      tickets = await prisma.ticket.findMany({
        where: { creatorId: userId },
        include: {
          creator: { select: { id: true, name: true, email: true } },
          assignee: { select: { id: true, name: true, email: true } },
          _count: { select: { responses: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ message: 'Failed to fetch tickets' }, { status: 500 });
  }
}

// Create a new ticket
export async function POST(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { subject, description, priority, category } = await request.json();

    if (!subject || !description) {
      return NextResponse.json({ message: 'Subject and description are required' }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        subject,
        description,
        priority: priority || 'medium',
        category: category || 'support',
        creatorId: userId,
      },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'created',
        entityType: 'ticket',
        entityId: ticket.id,
        description: `Created support ticket: ${subject}`,
        userId,
      },
    });

    // Notify admins about new ticket
    const admins = await prisma.user.findMany({
      where: { isAdmin: true },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: admins.map((admin: { id: number }) => ({
        title: 'New Support Ticket',
        message: `New ticket: ${subject}`,
        type: 'info',
        link: `/admin/tickets/${ticket.id}`,
        userId: admin.id,
      })),
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ message: 'Failed to create ticket' }, { status: 500 });
  }
}
