import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

// GET /api/crm/leads/[id]
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!lead) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    }

    // Check authorization
    if (!isAdmin(auth.user) && lead.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/crm/leads/[id]
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    }

    if (!isAdmin(auth.user) && existingLead.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { name, email, phone, company, source, status, notes, value } = await request.json();

    const lead = await prisma.lead.update({
      where: { id: leadId },
      data: {
        name,
        email,
        phone,
        company,
        source,
        status,
        notes,
        value: value !== undefined ? parseFloat(value) : undefined,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        action: 'updated',
        entityType: 'lead',
        entityId: lead.id,
        description: `Updated lead: ${lead.name}`,
        userId: auth.user.userId,
      },
    });

    return NextResponse.json(lead);
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/crm/leads/[id]
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await verifyAuth(request);
  if ('error' in auth) {
    return NextResponse.json({ message: auth.error }, { status: auth.status });
  }

  try {
    const { id } = await params;
    const leadId = parseInt(id);

    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return NextResponse.json({ message: 'Lead not found' }, { status: 404 });
    }

    if (!isAdmin(auth.user) && existingLead.userId !== auth.user.userId) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await prisma.lead.delete({
      where: { id: leadId },
    });

    return NextResponse.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
