import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/crm/deals/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const dealId = parseInt(id);

    const deal = await prisma.deal.findUnique({
      where: { id: dealId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        contact: true,
      },
    });

    if (!deal) {
      return NextResponse.json({ message: 'Deal not found' }, { status: 404 });
    }

    if (!isAdmin(auth.user) && deal.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/crm/deals/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const dealId = parseInt(id);

    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!existingDeal) {
      return NextResponse.json({ message: 'Deal not found' }, { status: 404 });
    }

    if (!isAdmin(auth.user) && existingDeal.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { title, description, value, currency, stage, probability, expectedCloseDate, actualCloseDate, contactId } = await request.json();

    const deal = await prisma.deal.update({
      where: { id: dealId },
      data: {
        title,
        description,
        value: value !== undefined ? parseFloat(value) : undefined,
        currency,
        stage,
        probability: probability !== undefined ? parseInt(probability) : undefined,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : undefined,
        actualCloseDate: actualCloseDate ? new Date(actualCloseDate) : undefined,
        contactId: contactId !== undefined ? (contactId ? parseInt(contactId) : null) : undefined,
      },
    });

    await prisma.activity.create({
      data: {
        action: 'updated',
        entityType: 'deal',
        entityId: deal.id,
        description: `Updated deal: ${deal.title}`,
        userId: auth.user.userId,
      },
    });

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/crm/deals/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const dealId = parseInt(id);

    const existingDeal = await prisma.deal.findUnique({
      where: { id: dealId },
    });

    if (!existingDeal) {
      return NextResponse.json({ message: 'Deal not found' }, { status: 404 });
    }

    if (!isAdmin(auth.user) && existingDeal.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.deal.delete({
      where: { id: dealId },
    });

    return NextResponse.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
