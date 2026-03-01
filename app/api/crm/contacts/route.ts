import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/crm/contacts
export async function GET(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const contacts = await prisma.contact.findMany({
      where: isAdmin(auth.user) ? {} : { userId: auth.user.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { deals: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/crm/contacts
export async function POST(request: Request) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { name, email, phone, company, position, notes } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        phone,
        company,
        position,
        notes,
        userId: auth.user.userId,
      },
    });

    await prisma.activity.create({
      data: {
        action: 'created',
        entityType: 'contact',
        entityId: contact.id,
        description: `Created contact: ${name}`,
        userId: auth.user.userId,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
