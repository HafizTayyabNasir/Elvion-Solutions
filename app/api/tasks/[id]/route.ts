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
        subtasks: { orderBy: { createdAt: 'asc' } },
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
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
        ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
        ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId ? parseInt(data.assigneeId) : null }),
        ...(data.estimatedHours !== undefined && { estimatedHours: data.estimatedHours ? parseFloat(data.estimatedHours) : null }),
        ...(data.actualHours !== undefined && { actualHours: data.actualHours ? parseFloat(data.actualHours) : null }),
        ...(data.budget !== undefined && { budget: data.budget ? parseFloat(data.budget) : null }),
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

    // Auto-add assignee as project member if not already
    if (task.projectId && task.assigneeId) {
      const existingMember = await prisma.projectMember.findFirst({
        where: { projectId: task.projectId, userId: task.assigneeId },
      });
      if (!existingMember) {
        await prisma.projectMember.create({
          data: { projectId: task.projectId, userId: task.assigneeId, role: 'member' },
        });
      }
    }

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
