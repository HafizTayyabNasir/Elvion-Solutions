import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ message: 'Email and verification code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email is already verified' });
    }

    // Check code and expiry
    if (user.verificationCode !== code) {
      return NextResponse.json({ message: 'Invalid verification code' }, { status: 400 });
    }

    if (!user.verificationExpiry || user.verificationExpiry < new Date()) {
      return NextResponse.json({ message: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    // Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Email verified successfully! You can now login.' });
  } catch (error) {
    console.error('Code verification error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
