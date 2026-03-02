import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import crypto from 'crypto';

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  let email: string | undefined;

  try {
    const body = await request.json();
    email = body.email;

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: 'Email is already verified' }, { status: 400 });
    }

    if (!isEmailConfigured()) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
      return NextResponse.json({ message: 'Email auto-verified (email service not configured). You can now login.' });
    }

    // Generate new verification token + code
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationCode = generate6DigitCode();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationCode,
        verificationExpiry,
      },
    });

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    const result = await sendEmail(
      email,
      'Verify Your Email - Elvion Solutions',
      `Your verification code is: ${verificationCode}\n\nOr verify via link: ${verificationUrl}`,
      `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 30px; border-radius: 10px;">
          <h1 style="color: #00D28D; margin-bottom: 20px; text-align: center;">Elvion Solutions</h1>
          <div style="background: #fff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1a1a2e; margin-bottom: 15px; text-align: center;">Verify Your Email</h2>
            <p style="margin-bottom: 20px;">Hi ${user.name || 'there'},</p>
            <p style="margin-bottom: 20px;">Use the verification code below to verify your email address:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #f8f9fa; border: 2px dashed #00D28D; border-radius: 10px; padding: 20px; display: inline-block;">
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">Your Verification Code</p>
                <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1a1a2e; font-family: monospace;">${verificationCode}</div>
              </div>
            </div>

            <p style="text-align: center; color: #666; margin: 20px 0;">Or click the button below:</p>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${verificationUrl}" style="background-color: #00D28D; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="margin-top: 20px; color: #666; font-size: 14px; text-align: center;">This code expires in 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
      `
    );

    if (result === null) {
      return NextResponse.json({ message: 'Email service is not available. Please contact support.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Verification code sent! Check your email.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json({ message: 'Failed to send verification code. Please try again or contact support.' }, { status: 500 });
  }
}
