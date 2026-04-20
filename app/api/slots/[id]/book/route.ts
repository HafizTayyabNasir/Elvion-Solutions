import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

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

        const slotId = parseInt(id);
        if (isNaN(slotId)) {
            return NextResponse.json({ message: 'Invalid slot ID' }, { status: 400 });
        }

        const slot = await prisma.slot.findUnique({ where: { id: slotId } });

        if (!slot) {
            return NextResponse.json({ message: 'Slot not found' }, { status: 404 });
        }

        if (slot.isBooked) {
            return NextResponse.json({ message: 'Slot already booked' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { name: true }
        });

        await prisma.slot.update({
            where: { id: slotId },
            data: {
                isBooked: true,
                bookedBy: userEmail,
                bookedByName: user?.name || null
            }
        });

        return NextResponse.json({ message: 'Slot booked successfully' });
    } catch (error) {
        console.error('Booking error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
