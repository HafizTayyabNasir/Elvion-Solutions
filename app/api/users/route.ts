import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  if (!isAdmin(auth.user)) {
    return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isAdmin: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

