import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// GET all subtasks for a task
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const taskId = parseInt(id);

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(subtasks);
  } catch (error) {
    console.error('Error fetching subtasks:', error);
    return NextResponse.json({ message: 'Failed to fetch subtasks' }, { status: 500 });
  }
}

// POST create a subtask
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const taskId = parseInt(id);
    const { title, status, startDate, dueDate } = await request.json();

    if (!title) {
      return NextResponse.json({ message: 'Subtask title is required' }, { status: 400 });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const subtask = await prisma.subtask.create({
      data: {
        title,
        status: status || 'pending',
        taskId,
        startDate: startDate ? new Date(startDate) : null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    await prisma.activity.create({
      data: {
        action: 'created',
        entityType: 'subtask',
        entityId: subtask.id,
        description: `Created subtask: ${title} under task: ${task.title}`,
        userId,
      },
    });

    return NextResponse.json(subtask, { status: 201 });
  } catch (error) {
    console.error('Error creating subtask:', error);
    return NextResponse.json({ message: 'Failed to create subtask' }, { status: 500 });
  }
}
