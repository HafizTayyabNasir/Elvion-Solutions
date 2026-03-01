import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get all tasks for user
export async function GET(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const user = await prisma.user.findUnique({ where: { id: userId } });

    let tasks;
    if (user?.isAdmin) {
      tasks = await prisma.task.findMany({
        where: projectId ? { projectId: parseInt(projectId) } : undefined,
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      tasks = await prisma.task.findMany({
        where: {
          AND: [
            projectId ? { projectId: parseInt(projectId) } : {},
            {
              OR: [
                { assigneeId: userId },
                { creatorId: userId },
                { project: { members: { some: { userId } } } },
              ],
            },
          ],
        },
        include: {
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } },
          creator: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Create a new task
export async function POST(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, status, priority, dueDate, projectId, assigneeId } = await request.json();

    if (!title) {
      return NextResponse.json({ message: 'Task title is required' }, { status: 400 });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: projectId ? parseInt(projectId) : null,
        assigneeId: assigneeId ? parseInt(assigneeId) : null,
        creatorId: userId,
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
        action: 'created',
        entityType: 'task',
        entityId: task.id,
        description: `Created task: ${title}`,
        userId,
      },
    });

    // Notify assignee
    if (assigneeId && assigneeId !== userId) {
      await prisma.notification.create({
        data: {
          title: 'New Task Assigned',
          message: `You have been assigned to: ${title}`,
          type: 'info',
          link: projectId ? `/customer/projects/${projectId}` : '/customer/dashboard',
          userId: parseInt(assigneeId),
        },
      });
    }

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Failed to create task' }, { status: 500 });
  }
}
