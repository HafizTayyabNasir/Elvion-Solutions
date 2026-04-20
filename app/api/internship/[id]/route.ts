import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const applicationId = parseInt(id);

    await prisma.internshipApplication.delete({
      where: { id: applicationId },
    });

    return NextResponse.json({ message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete internship application error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

