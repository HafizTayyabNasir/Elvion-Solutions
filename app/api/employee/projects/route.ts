import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// GET projects the logged-in employee is a member of
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

    const where: Record<string, unknown> = {
      OR: [
        { ownerId: employee.userId },
        { members: { some: { userId: employee.userId } } },
      ],
    };

    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        tasks: {
          where: { assigneeId: employee.userId },
          select: { id: true, status: true, title: true, priority: true, dueDate: true },
        },
        _count: { select: { tasks: true, invoices: true, files: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Enrich with employee's role in each project
    const enriched = projects.map((p: typeof projects[number]) => {
      const membership = p.members.find((m: typeof p.members[number]) => m.userId === employee.userId);
      const myTasks = p.tasks;
      const myDone = myTasks.filter((t: { status: string }) => t.status === 'done').length;
      return {
        ...p,
        myRole: membership?.role || (p.ownerId === employee.userId ? 'owner' : 'member'),
        myTaskCount: myTasks.length,
        myTasksDone: myDone,
        myTasksPending: myTasks.length - myDone,
      };
    });

    // Summary
    const summary = {
      total: enriched.length,
      active: enriched.filter((p: { status: string }) => p.status === 'active').length,
      completed: enriched.filter((p: { status: string }) => p.status === 'completed').length,
      onHold: enriched.filter((p: { status: string }) => p.status === 'on_hold').length,
    };

    return NextResponse.json({ projects: enriched, summary });
  } catch (error) {
    console.error('Employee projects error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
