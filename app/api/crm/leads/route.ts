import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/crm/leads - Get all leads (admin) or user's leads
export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const source = searchParams.get('source');

    const whereClause: Record<string, unknown> = isAdmin(auth.user) ? {} : { userId: auth.user.userId };
    
    if (status) whereClause.status = status;
    if (source) whereClause.source = source;

    const leads = await prisma.lead.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crm/leads - Create a new lead
export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { name, email, phone, company, source, notes, value } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    const lead = await prisma.lead.create({
      data: {
        name,
        email,
        phone,
        company,
        source,
        notes,
        value: value ? parseFloat(value) : null,
        userId: auth.user.userId,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        action: 'created',
        entityType: 'lead',
        entityId: lead.id,
        description: `Created lead: ${name}`,
        userId: auth.user.userId,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
