import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET /api/briefs/[id] - Get a single brief
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const brief = await prisma.brief.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    return NextResponse.json({ brief });

  } catch (error) {
    console.error('Error fetching brief:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brief' },
      { status: 500 }
    );
  }
}

// PATCH /api/briefs/[id] - Update a brief (bookmark, status, etc.)
export async function PATCH(
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

    // Update allowed fields
    const { isBookmarked, status, title, description } = body;
    
    const brief = await prisma.brief.update({
      where: { id },
      data: {
        ...(isBookmarked !== undefined && { isBookmarked }),
        ...(status && { status }),
        ...(title && { title }),
        ...(description && { description }),
      }
    });

    return NextResponse.json({ brief });

  } catch (error) {
    console.error('Error updating brief:', error);
    return NextResponse.json(
      { error: 'Failed to update brief' },
      { status: 500 }
    );
  }
}

// DELETE /api/briefs/[id] - Delete a brief
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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

    await prisma.brief.delete({ where: { id } });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting brief:', error);
    return NextResponse.json(
      { error: 'Failed to delete brief' },
      { status: 500 }
    );
  }
}
