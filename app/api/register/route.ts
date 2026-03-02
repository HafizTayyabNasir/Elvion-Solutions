import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, isEmailConfigured } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { name, email, password, phone, company } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const smtpAvailable = isEmailConfigured();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        company,
        verificationToken,
        verificationExpiry,
        isVerified: !smtpAvailable, // auto-verify if SMTP not configured
      },
    });

    // Send verification email
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    try {
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
              <h2 style="color: #1a1a2e; margin-bottom: 15px;">Welcome to Elvion Solutions!</h2>
              <p style="margin-bottom: 20px;">Hi ${name || 'there'},</p>
              <p style="margin-bottom: 20px;">Thank you for creating an account. Please verify your email address by clicking the button below:</p>
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
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue with registration even if email fails
    }

    return NextResponse.json({ 
      message: 'User created successfully. Please check your email to verify your account.', 
      userId: user.id,
      requiresVerification: true,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
