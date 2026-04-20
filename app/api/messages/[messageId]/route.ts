import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ messageId: string }> }
) {
  try {
    const { messageId } = await context.params;
    await prisma.message.delete({
      where: { id: parseInt(messageId) },
    });

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
