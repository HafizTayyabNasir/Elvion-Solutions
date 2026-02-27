import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
type SlotRow = {
  id: number;
  date: string;
  time: string;
  isBooked: boolean;
  bookedBy: string | null;
  bookedByName: string | null;
};

export async function GET() {
  try {
    // Only return slots created by admin (no auto-creation)
    const slots = await prisma.slot.findMany({
      orderBy: [{ date: 'asc' }, { time: 'asc' }]
    });

    return NextResponse.json(slots.map((s: SlotRow) => ({
      id: s.id,
      date: s.date,
      time: s.time,
      is_booked: s.isBooked,
      booked_by: s.bookedBy,
      booked_by_name: s.bookedByName
    })));
  } catch (error) {
    console.error('Slots error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { date, time } = await request.json();

    if (!date || !time) {
      return NextResponse.json({ message: 'Date and time required' }, { status: 400 });
    }

    const slot = await prisma.slot.create({
      data: {
        date,
        time,
        isBooked: false
      }
    });

    return NextResponse.json({
      id: slot.id,
      date: slot.date,
      time: slot.time,
      is_booked: slot.isBooked
    });
  } catch (error) {
    console.error('Create slot error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
