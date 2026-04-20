import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/crm/deals
export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');

    const whereClause: Record<string, unknown> = isAdmin(auth.user) ? {} : { userId: auth.user.userId };
    if (stage) whereClause.stage = stage;

    const deals = await prisma.deal.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        contact: { select: { id: true, name: true, email: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crm/deals
export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { title, description, value, currency, stage, probability, expectedCloseDate, contactId } = await request.json();

    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const deal = await prisma.deal.create({
      data: {
        title,
        description,
        value: value ? parseFloat(value) : 0,
        currency: currency || 'USD',
        stage: stage || 'proposal',
        probability: probability ? parseInt(probability) : 0,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        contactId: contactId ? parseInt(contactId) : null,
        userId: auth.user.userId,
      },
    });

    await prisma.activity.create({
      data: {
        action: 'created',
        entityType: 'deal',
        entityId: deal.id,
        description: `Created deal: ${title}`,
        userId: auth.user.userId,
      },
    });

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
