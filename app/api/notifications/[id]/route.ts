import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Mark single notification as read
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
    const notificationId = parseInt(id);

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return NextResponse.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json({ message: 'Failed to update notification' }, { status: 500 });
  }
}

// Delete notification
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const notificationId = parseInt(id);

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json({ message: 'Notification not found' }, { status: 404 });
    }

    if (notification.userId !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    await prisma.notification.delete({ where: { id: notificationId } });

    return NextResponse.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json({ message: 'Failed to delete notification' }, { status: 500 });
  }
}
