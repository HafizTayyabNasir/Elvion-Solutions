import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

type CommentRow = { id: number; userName: string; text: string; date: Date };

export async function GET(request: Request) {
  try {
    // Require authentication to view comments
    const auth = await verifyAuth(request);
    if ('error' in auth) {
      return NextResponse.json({ message: auth.error }, { status: auth.status });
    }
    if (!isAdmin(auth.user)) {
      return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
    }

    const comments = await prisma.comment.findMany({
      orderBy: { date: 'desc' },
    });

    const formatted = comments.map((c: CommentRow) => ({
        id: c.id,
        user_name: c.userName,
        text: c.text,
        date: c.date.toISOString().split('T')[0]
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        // Require authentication to create comments
        const auth = await verifyAuth(request);
        if ('error' in auth) {
          return NextResponse.json({ message: auth.error }, { status: auth.status });
        }
        if (!isAdmin(auth.user)) {
          return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
        }

        const { user_name, text } = await request.json();
        if (!user_name || !text) {
          return NextResponse.json({ message: 'user_name and text are required' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                userName: user_name,
                text
            }
        });
        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error('Create comment error:', error);
        return NextResponse.json({ message: 'Failed to create comment' }, { status: 500 });
    }
}
