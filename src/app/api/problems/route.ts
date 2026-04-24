import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const problems = await prisma.problem.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        promptTemplate: true,
        difficulty: true,
        answerType: true,
        tolerance: true,
      },
      orderBy: [{ difficulty: 'asc' }, { createdAt: 'asc' }],
    });

    return NextResponse.json({
      count: problems.length,
      problems,
    });
  } catch (error) {
    console.error('[api/problems] Failed to list problems:', error);
    return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
  }
}
