import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    console.log('Attempting to fetch users from database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        elo: true,
        problemsSolved: true,
      },
      orderBy: {
        elo: 'desc' as const,
      },
    });
    console.log('Successfully fetched users:', users.length);
    return NextResponse.json(users);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Detailed error fetching users:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      return NextResponse.json(
        { error: 'Failed to fetch users: ' + error.message },
        { status: 500 }
      );
    }
    console.error('Unknown error fetching users');
    return NextResponse.json(
      { error: 'Failed to fetch users: Unknown error' },
      { status: 500 }
    );
  }
} 