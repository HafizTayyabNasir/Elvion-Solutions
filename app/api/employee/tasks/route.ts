import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET tasks assigned to the logged-in employee
export async function GET(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: result.user.userId },
      select: { id: true, userId: true },
    });

    if (!employee || !employee.userId) {
      return NextResponse.json({ message: 'No employee record found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const projectId = searchParams.get('projectId');

    const where: Record<string, unknown> = {
      OR: [
        { assigneeId: employee.userId },
        { creatorId: employee.userId },
      ],
    };

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (projectId) where.projectId = parseInt(projectId);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Summary counts
    const summary = {
      total: tasks.length,
      todo: tasks.filter((t: { status: string }) => t.status === 'todo').length,
      inProgress: tasks.filter((t: { status: string }) => t.status === 'in_progress').length,
      review: tasks.filter((t: { status: string }) => t.status === 'review').length,
      done: tasks.filter((t: { status: string }) => t.status === 'done').length,
      overdue: tasks.filter((t: { status: string; dueDate: Date | null }) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
    };

    return NextResponse.json({ tasks, summary });
  } catch (error) {
    console.error('Employee tasks error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update task status (employee can only update tasks assigned to them)
export async function PUT(request: Request) {
  try {
    const result = await verifyAuth(request);
    if ('error' in result) {
      return NextResponse.json({ message: result.error }, { status: result.status });
    }

    const employee = await prisma.employee.findUnique({
      where: { userId: result.user.userId },
      select: { id: true, userId: true },
    });

    if (!employee || !employee.userId) {
      return NextResponse.json({ message: 'No employee record found' }, { status: 404 });
    }

    const { taskId, status } = await request.json();

    if (!taskId || !status) {
      return NextResponse.json({ message: 'Task ID and status required' }, { status: 400 });
    }

    const validStatuses = ['todo', 'in_progress', 'review', 'done'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    // Verify the employee is assigned to or created this task
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
        OR: [
          { assigneeId: employee.userId },
          { creatorId: employee.userId },
        ],
      },
    });

    if (!task) {
      return NextResponse.json({ message: 'Task not found or not authorized' }, { status: 404 });
    }

    const updated = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: {
        status,
        completedAt: status === 'done' ? new Date() : null,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true } },
      },
    });

    // Update project progress if task belongs to a project
    if (updated.projectId) {
      const projectTasks = await prisma.task.findMany({
        where: { projectId: updated.projectId },
        select: { status: true },
      });
      const doneTasks = projectTasks.filter((t: { status: string }) => t.status === 'done').length;
      const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
      await prisma.project.update({
        where: { id: updated.projectId },
        data: { progress },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Employee task update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
