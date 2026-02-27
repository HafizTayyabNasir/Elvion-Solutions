import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Check if it's admin credentials from environment variables
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Check if admin user exists in database, if not create it
      let adminUser = await prisma.user.findUnique({
        where: { email: ADMIN_EMAIL },
      });

      if (!adminUser) {
        // Create admin user if it doesn't exist
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        adminUser = await prisma.user.create({
          data: {
            email: ADMIN_EMAIL,
            name: 'Admin',
            password: hashedPassword,
            isAdmin: true,
          },
        });
      } else if (!adminUser.isAdmin) {
        // Update existing user to admin if not already
        adminUser = await prisma.user.update({
          where: { email: ADMIN_EMAIL },
          data: { isAdmin: true },
        });
      }

      const token = jwt.sign(
        { userId: adminUser.id, email: adminUser.email, is_admin: true, name: adminUser.name },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return NextResponse.json({ access_token: token });
    }

    // Regular user login
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, is_admin: user.isAdmin, name: user.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return NextResponse.json({ access_token: token });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
