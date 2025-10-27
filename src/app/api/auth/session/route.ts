import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verify } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Nicht angemeldet', authenticated: false },
        { status: 401 }
      );
    }

    // Verify JWT
    let decoded: any;
    try {
      decoded = verify(sessionToken, JWT_SECRET);
    } catch (err) {
      return NextResponse.json(
        { error: 'Ungültiger Token', authenticated: false },
        { status: 401 }
      );
    }

    // Check session in database
    const session = await prisma.session.findUnique({
      where: { sessionToken },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
          }
        }
      }
    });

    if (!session || session.expires < new Date()) {
      return NextResponse.json(
        { error: 'Session abgelaufen', authenticated: false },
        { status: 401 }
      );
    }

    if (!session.user.isActive) {
      return NextResponse.json(
        { error: 'Account deaktiviert', authenticated: false },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: session.user,
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Session-Check', authenticated: false },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
