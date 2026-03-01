import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export interface JWTPayload {
  userId: number;
  email: string;
  is_admin: boolean;
  name: string;
}

export async function verifyAuth(request: Request): Promise<{ user: JWTPayload } | { error: string; status: number }> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user: decoded };
  } catch {
    return { error: 'Invalid token', status: 401 };
  }
}

export function isAdmin(user: JWTPayload): boolean {
  return user.is_admin === true;
}

// Simple helper that returns just the userId (used by project/ticket/invoice routes)
export async function verifyToken(request: Request): Promise<number | null> {
  const result = await verifyAuth(request);
  if ('error' in result) return null;
  return result.user.userId;
}
