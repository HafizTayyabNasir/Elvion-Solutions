import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail, isEmailConfigured } from '@/lib/email';

function generate6DigitCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    
    // Generate verification token + 6-digit code
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationCode = generate6DigitCode();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const emailAvailable = isEmailConfigured();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        company,
        verificationToken,
        verificationCode,
        verificationExpiry,
        isVerified: !emailAvailable, // auto-verify if no email provider
      },
    });

    if (!emailAvailable) {
      return NextResponse.json({ 
        message: 'Account created successfully! You can now login.', 
        userId: user.id,
        requiresVerification: false,
      }, { status: 201 });
    }

    // Send verification email with both link + 6-digit code
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;
    
    try {
      await sendEmail(
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
              <h2 style="color: #1a1a2e; margin-bottom: 15px; text-align: center;">Welcome! Verify Your Email</h2>
              <p style="margin-bottom: 20px;">Hi ${name || 'there'},</p>
              <p style="margin-bottom: 20px;">Thank you for creating an account with Elvion Solutions. Use the verification code below to verify your email:</p>
              
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
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't auto-verify — user must verify via code/link
      // The code is still saved in DB, so resend will work
    }

    return NextResponse.json({ 
      message: 'Account created! Please check your email for the verification code.', 
      userId: user.id,
      email: user.email,
      requiresVerification: true,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
