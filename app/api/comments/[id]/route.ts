import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { text } = await request.json();

    const comment = await prisma.comment.update({
        where: { id: parseInt(id) },
        data: { text }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
