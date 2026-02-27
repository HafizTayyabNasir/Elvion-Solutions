import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
type SlotRow = {
    id: number;
    date: string;
    time: string;
    isBooked: boolean;
    bookedBy: string | null;
    bookedByName: string | null;
};

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function GET(request: Request) {
    try {
        // Auth Check
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let userEmail: string | null = null;

        try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            userEmail = decoded.email;
        } catch (error) {
            return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
        }

        if (!userEmail) {
            return NextResponse.json({ message: 'User email not found in token' }, { status: 400 });
        }

        // Fetch user's booked slots
        const bookedSlots = await prisma.slot.findMany({
            where: {
                isBooked: true,
                bookedBy: userEmail
            },
            orderBy: [
                { date: 'asc' },
                { time: 'asc' }
            ]
        });

        return NextResponse.json(bookedSlots.map((s: SlotRow) => ({
            id: s.id,
            date: s.date,
            time: s.time,
            is_booked: s.isBooked,
            booked_by: s.bookedBy,
            booked_by_name: s.bookedByName
        })));
    } catch (error) {
        console.error('My bookings error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
