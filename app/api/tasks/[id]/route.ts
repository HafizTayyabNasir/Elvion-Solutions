import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get single task
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
    const taskId = parseInt(id);

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ message: 'Failed to fetch task' }, { status: 500 });
  }
}

// Update task
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
    const taskId = parseInt(id);
    const data = await request.json();

    const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existingTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId ? parseInt(data.assigneeId) : null,
        completedAt: data.status === 'done' && existingTask.status !== 'done' ? new Date() : existingTask.completedAt,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'updated',
        entityType: 'task',
        entityId: task.id,
        description: `Updated task: ${task.title}`,
        userId,
      },
    });

    // Update project progress if task is part of a project
    if (task.projectId) {
      const projectTasks = await prisma.task.findMany({
        where: { projectId: task.projectId },
      });
      const completedTasks = projectTasks.filter((t: { status: string }) => t.status === 'done').length;
      const progress = projectTasks.length > 0 ? Math.round((completedTasks / projectTasks.length) * 100) : 0;
      
      await prisma.project.update({
        where: { id: task.projectId },
        data: { progress },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: 'Failed to update task' }, { status: 500 });
  }
}

// Delete task
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
    const taskId = parseInt(id);

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    // Only creator, assignee, or admin can delete
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin && task.creatorId !== userId && task.assigneeId !== userId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    await prisma.task.delete({ where: { id: taskId } });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'deleted',
        entityType: 'task',
        entityId: taskId,
        description: `Deleted task: ${task.title}`,
        userId,
      },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ message: 'Failed to delete task' }, { status: 500 });
  }
}
