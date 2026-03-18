import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get all projects for the user
export async function GET(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const url = new URL(request.url);
    const contactId = url.searchParams.get('clientId');

    let projects;
    if (user?.isAdmin) {
      // Admins see all projects, optionally filtered by contactId
      projects = await prisma.project.findMany({
        where: contactId ? { contactId: parseInt(contactId) } : undefined,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          contact: { select: { id: true, name: true, email: true, company: true } },
          members: {
            include: { user: { select: { id: true, name: true, email: true } } }
          },
          tasks: {
            select: { id: true, title: true, status: true, priority: true, dueDate: true, startDate: true, budget: true, estimatedHours: true, actualHours: true, assignee: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
          },
          payments: {
            orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
          },
          _count: { select: { tasks: true, invoices: true, files: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // Users see their own projects and projects they're members of
      projects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          contact: { select: { id: true, name: true, email: true, company: true } },
          members: {
            include: { user: { select: { id: true, name: true, email: true } } }
          },
          tasks: {
            select: { id: true, title: true, status: true, priority: true, dueDate: true, startDate: true, budget: true, estimatedHours: true, actualHours: true, assignee: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
          },
          payments: {
            orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
          },
          _count: { select: { tasks: true, invoices: true, files: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Failed to fetch projects' }, { status: 500 });
  }
}

// Create a new project
export async function POST(request: Request) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Only admins can create projects' }, { status: 403 });
    }

    const { name, description, status, priority, startDate, endDate, budget, clientId, memberIds } = await request.json();

    if (!name) {
      return NextResponse.json({ message: 'Project name is required' }, { status: 400 });
    }

    // Build team members array (employees only, not clients)
    const membersToCreate: { userId: number; role: string }[] = [];
    if (memberIds && Array.isArray(memberIds)) {
      for (const mid of memberIds) {
        if (!membersToCreate.some(m => m.userId === mid)) {
          membersToCreate.push({ userId: mid, role: 'member' });
        }
      }
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        status: status || 'active',
        priority: priority || 'medium',
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? parseFloat(budget) : null,
        ownerId: userId,
        contactId: clientId ? parseInt(clientId) : null,
        members: membersToCreate.length > 0 ? {
          create: membersToCreate
        } : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, name: true, email: true, company: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
      },
    });

    // Create activity log
    await prisma.activity.create({
      data: {
        action: 'created',
        entityType: 'project',
        entityId: project.id,
        description: `Created project: ${name}`,
        userId,
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ message: 'Failed to create project' }, { status: 500 });
  }
}
