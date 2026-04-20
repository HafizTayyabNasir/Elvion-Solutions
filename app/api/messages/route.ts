import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
type MessageRow = { id: number; name: string; email: string; message: string; date: Date };

export async function POST(request: Request) {
  try {
    const { name, email, message, date } = await request.json();

    await prisma.message.create({
      data: {
        name,
        email,
        message,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Message error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { date: 'desc' },
    });
    
    const formattedMessages = messages.map((msg: MessageRow) => ({
        ...msg,
        date: msg.date.toISOString().split('T')[0]
    }));

    return NextResponse.json(formattedMessages);
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
