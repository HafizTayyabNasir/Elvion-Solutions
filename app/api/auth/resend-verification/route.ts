import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, isEmailConfigured } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

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
      // Auto-verify the user when SMTP is not available
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
      return NextResponse.json({ message: 'Email auto-verified (email service not configured). You can now login.' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationExpiry,
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    await sendEmail(
      email,
      'Verify Your Email - Elvion Solutions',
      `Please verify your email by clicking the following link: ${verificationUrl}`,
      `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%); padding: 30px; border-radius: 10px;">
          <h1 style="color: #00D28D; margin-bottom: 20px; text-align: center;">Elvion Solutions</h1>
          <div style="background: #fff; padding: 30px; border-radius: 8px;">
            <h2 style="color: #1a1a2e; margin-bottom: 15px;">Verify Your Email</h2>
            <p style="margin-bottom: 20px;">Hi ${user.name || 'there'},</p>
            <p style="margin-bottom: 20px;">Thank you for registering with Elvion Solutions. Please click the button below to verify your email address:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #00D28D; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
            </div>
            <p style="margin-bottom: 10px; color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #00D28D; font-size: 14px;">${verificationUrl}</p>
            <p style="margin-top: 20px; color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
        </div>
      </body>
      </html>
      `
    );

    return NextResponse.json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    // If email fails, auto-verify the user so they can still login
    try {
      const { email: retryEmail } = await request.clone().json();
      if (retryEmail) {
        await prisma.user.update({
          where: { email: retryEmail },
          data: { isVerified: true },
        });
        return NextResponse.json({ message: 'Email service unavailable. Your account has been auto-verified. You can now login.' });
      }
    } catch (innerError) {
      console.error('Auto-verify fallback error:', innerError);
    }
    return NextResponse.json({ message: 'Failed to send verification email. Please contact support.' }, { status: 500 });
  }
}
