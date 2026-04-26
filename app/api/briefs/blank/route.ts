import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const brief = await prisma.brief.create({
      data: {
        userId: session.user.id,
        title: 'Untitled Sermon',
        status: 'draft',
        category: 'topical',
      }
    });

    return NextResponse.json({ success: true, briefId: brief.id });
  } catch (error) {
    console.error('Error creating blank brief:', error);
    return NextResponse.json(
      { error: 'Failed to create blank brief' },
      { status: 500 }
    );
  }
}

