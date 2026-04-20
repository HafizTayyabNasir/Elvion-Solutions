import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// PUT update a subtask
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { subtaskId } = await params;
    const data = await request.json();

    const subtask = await prisma.subtask.update({
      where: { id: parseInt(subtaskId) },
      data: {
        title: data.title,
        status: data.status,
        startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
        dueDate: data.dueDate !== undefined ? (data.dueDate ? new Date(data.dueDate) : null) : undefined,
      },
    });

    await prisma.activity.create({
      data: {
        action: 'updated',
        entityType: 'subtask',
        entityId: subtask.id,
        description: `Updated subtask: ${subtask.title}`,
        userId,
      },
    });

    return NextResponse.json(subtask);
  } catch (error) {
    console.error('Error updating subtask:', error);
    return NextResponse.json({ message: 'Failed to update subtask' }, { status: 500 });
  }
}

// DELETE a subtask
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; subtaskId: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { subtaskId } = await params;

    await prisma.subtask.delete({ where: { id: parseInt(subtaskId) } });

    return NextResponse.json({ message: 'Subtask deleted' });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    return NextResponse.json({ message: 'Failed to delete subtask' }, { status: 500 });
  }
}
