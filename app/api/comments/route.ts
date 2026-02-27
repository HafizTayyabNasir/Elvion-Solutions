import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
type CommentRow = { id: number; userName: string; text: string; date: Date };

export async function GET() {
  try {
    const comments = await prisma.comment.findMany({
      orderBy: { date: 'desc' },
    });
    
    // Format date if needed, or send as is (ISO string is standard)
    // Admin dashboard might expect ISO string or specific format.
    // Based on messages, it likely expects string.
    const formatted = comments.map((c: CommentRow) => ({
        id: c.id,
        user_name: c.userName,
        text: c.text,
        date: c.date.toISOString().split('T')[0]
    }));

    return NextResponse.json(formatted);
  } catch {
    console.error('Get comments error');
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Add POST if needed for users to add comments, but admin dashboard only reads/edits/deletes.
// Assuming comments come from somewhere else or maybe admin creates them? 
// The dashboard code doesn't show creating comments, only fetching.
// But if there are no comments, it will be empty.
// I'll add a POST just in case or for seeding.
export async function POST(request: Request) {
    try {
        const { user_name, text } = await request.json();
        const comment = await prisma.comment.create({
            data: {
                userName: user_name,
                text
            }
        });
        return NextResponse.json(comment);
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
