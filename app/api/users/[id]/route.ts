import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/users/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const userId = parseInt(id);

  // Users can only view their own profile, admins can view anyone
  if (!isAdmin(auth.user) && auth.user.userId !== userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true,
        isAdmin: true, isVerified: true, createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/users/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  const { id } = await params;
  const userId = parseInt(id);

  // Users can only update their own profile, admins can update anyone
  if (!isAdmin(auth.user) && auth.user.userId !== userId) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updateData: Record<string, unknown> = {};

    // Fields any user can update on their own profile
    if (body.name !== undefined) updateData.name = body.name;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;

    // Password change
    if (body.password) {
      if (body.currentPassword && !isAdmin(auth.user)) {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        const validPassword = await bcrypt.compare(body.currentPassword, existingUser.password);
        if (!validPassword) {
          return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
        }
      }
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    // Admin-only fields
    if (isAdmin(auth.user)) {
      if (body.isAdmin !== undefined) updateData.isAdmin = body.isAdmin;
      if (body.isVerified !== undefined) updateData.isVerified = body.isVerified;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true, name: true, email: true, phone: true,
        isAdmin: true, isVerified: true, createdAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/users/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  if (!isAdmin(auth.user)) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  const { id } = await params;
  const userId = parseInt(id);

  // Prevent self-deletion
  if (auth.user.userId === userId) {
    return NextResponse.json({ message: 'Cannot delete your own account' }, { status: 400 });
  }

  try {
    // Delete related records first to avoid foreign key constraints
    // Most relations have onDelete: Cascade, but Task creator/assignee don't
    await prisma.$transaction([
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.activity.deleteMany({ where: { userId } }),
      prisma.projectMember.deleteMany({ where: { userId } }),
      prisma.task.deleteMany({ where: { creatorId: userId } }),
      prisma.task.updateMany({ where: { assigneeId: userId }, data: { assigneeId: null } }),
      prisma.ticket.updateMany({ where: { assigneeId: userId }, data: { assigneeId: null } }),
      prisma.lead.deleteMany({ where: { userId } }),
      prisma.contact.deleteMany({ where: { userId } }),
      prisma.deal.deleteMany({ where: { userId } }),
      prisma.user.delete({ where: { id: userId } }),
    ]);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Failed to delete user. They may have associated records.' }, { status: 500 });
  }
}
