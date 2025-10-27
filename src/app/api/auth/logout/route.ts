import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session-token')?.value;

    if (sessionToken) {
      // Delete session from database
      await prisma.session.deleteMany({
        where: { sessionToken }
      });
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logout erfolgreich'
    });

    // Clear cookie
    response.cookies.delete('session-token');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Fehler beim Logout', details: String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
