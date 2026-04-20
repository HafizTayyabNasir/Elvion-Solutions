import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.slot.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error('Delete slot error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
