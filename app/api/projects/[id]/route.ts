import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get single project
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
    const projectId = parseInt(id);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } }
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            creator: { select: { id: true, name: true } },
            subtasks: { orderBy: { createdAt: 'asc' } },
          },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
        files: {
          orderBy: { createdAt: 'desc' },
        },
        payments: {
          orderBy: [{ paymentDate: 'desc' }, { createdAt: 'desc' }],
        },
      },
    });

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    // Check user has access
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const isMember = project.members.some((m: { userId: number }) => m.userId === userId);
    if (!user?.isAdmin && project.ownerId !== userId && !isMember) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ message: 'Failed to fetch project' }, { status: 500 });
  }
}

// Update project
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Only admins can update projects' }, { status: 403 });
    }

    const { id } = await params;
    const projectId = parseInt(id);
    const data = await request.json();

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        priority: data.priority,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budget: data.budget ? parseFloat(data.budget) : null,
        progress: data.progress !== undefined ? parseInt(data.progress) : undefined,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } }
        },
      },
    });

    // Update team members if provided
    if (data.memberIds && Array.isArray(data.memberIds)) {
      // Remove existing non-client members
      await prisma.projectMember.deleteMany({
        where: { projectId, role: { not: 'client' } },
      });
      // Add new members
      const newMembers = data.memberIds
        .filter((mid: number) => !project.members.some((m: { userId: number; role: string }) => m.userId === mid && m.role === 'client'))
        .map((mid: number) => ({ projectId, userId: mid, role: 'member' as const }));
      if (newMembers.length > 0) {
        await prisma.projectMember.createMany({ data: newMembers, skipDuplicates: true });
      }
    }

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'updated',
        entityType: 'project',
        entityId: project.id,
        description: `Updated project: ${project.name}`,
        userId,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ message: 'Failed to update project' }, { status: 500 });
  }
}

// Delete project
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyToken(request);
    if (!userId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) {
      return NextResponse.json({ message: 'Only admins can delete projects' }, { status: 403 });
    }

    const { id } = await params;
    const projectId = parseInt(id);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    await prisma.project.delete({ where: { id: projectId } });

    // Log activity
    await prisma.activity.create({
      data: {
        action: 'deleted',
        entityType: 'project',
        entityId: projectId,
        description: `Deleted project: ${project.name}`,
        userId,
      },
    });

    return NextResponse.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ message: 'Failed to delete project' }, { status: 500 });
  }
}
