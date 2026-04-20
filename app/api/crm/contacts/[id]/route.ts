import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/crm/contacts/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const contactId = parseInt(id);

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        deals: true,
      },
    });

    if (!contact) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
    }

    if (!isAdmin(auth.user) && contact.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/crm/contacts/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const contactId = parseInt(id);

    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
    }

    if (!isAdmin(auth.user) && existingContact.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, email, phone, company, position, notes } = await request.json();

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { name, email, phone, company, position, notes },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/crm/contacts/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const contactId = parseInt(id);

    const existingContact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!existingContact) {
      return NextResponse.json({ message: 'Contact not found' }, { status: 404 });
    }

    if (!isAdmin(auth.user) && existingContact.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.contact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
