import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// PUT /api/briefs/[id]/sermon - Save sermon content
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Verify ownership
    const existingBrief = await prisma.brief.findUnique({
      where: { id },
      select: { userId: true }
    });

    if (!existingBrief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    if (existingBrief.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const brief = await prisma.brief.update({
      where: { id },
      data: {
        sermonContent: body.content,
      },
      select: {
        id: true,
        sermonContent: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ success: true, brief });

  } catch (error) {
    console.error('Error saving sermon content:', error);
    return NextResponse.json(
      { error: 'Failed to save sermon content' },
      { status: 500 }
    );
  }
}
