import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// POST /api/telegram/link - Link Telegram account to Lighted user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { telegramChatId, linkToken: _linkToken } = body;

    if (!telegramChatId) {
      return NextResponse.json({ error: 'Missing telegramChatId' }, { status: 400 });
    }

    // Check if a placeholder user exists with this Telegram ID
    const placeholderUser = await prisma.user.findUnique({
      where: { telegramChatId: String(telegramChatId) }
    });

    if (placeholderUser && placeholderUser.id !== session.user.id) {
      // Transfer all briefs from placeholder to actual user
      await prisma.brief.updateMany({
        where: { userId: placeholderUser.id },
        data: { userId: session.user.id }
      });

      // Delete the placeholder user
      await prisma.user.delete({
        where: { id: placeholderUser.id }
      });
    }

    // Link Telegram to the authenticated user
    await prisma.user.update({
      where: { id: session.user.id },
      data: { telegramChatId: String(telegramChatId) }
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account linked successfully'
    });

  } catch (error) {
    console.error('Error linking Telegram:', error);
    return NextResponse.json(
      { error: 'Failed to link Telegram account' },
      { status: 500 }
    );
  }
}

// GET /api/telegram/link - Check if current user has Telegram linked
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { telegramChatId: true }
    });

    return NextResponse.json({
      linked: !!user?.telegramChatId,
      telegramChatId: user?.telegramChatId || null
    });

  } catch (error) {
    console.error('Error checking Telegram link:', error);
    return NextResponse.json(
      { error: 'Failed to check Telegram link' },
      { status: 500 }
    );
  }
}
