import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email und Passwort sind erforderlich' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ungültige Email oder Passwort' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Kein Passwort gesetzt. Bitte verwenden Sie Social Login.' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account ist deaktiviert. Bitte kontaktieren Sie den Support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Ungültige Email oder Passwort' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: request.ip || 'unknown',
      }
    });

    // Create session
    const sessionToken = sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: expiresAt,
      }
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login erfolgreich',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token: sessionToken,
    });

    // Set HTTP-only cookie
    response.cookies.set('session-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Login', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
