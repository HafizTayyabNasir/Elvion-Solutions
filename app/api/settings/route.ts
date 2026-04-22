import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

const DEFAULTS: Record<string, string> = {
  office_start_time: '09:00',
  office_end_time:   '18:00',
};

// GET /api/settings — returns all settings merged with defaults
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const rows = await prisma.setting.findMany();
    const result: Record<string, string> = { ...DEFAULTS };
    for (const row of rows) result[row.key] = row.value;

    return NextResponse.json(result);
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/settings — upserts one or more key-value pairs (admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }
    if (!authResult.user.is_admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body: Record<string, string> = await request.json();

    await Promise.all(
      Object.entries(body).map(([key, value]) =>
        prisma.setting.upsert({
          where:  { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
