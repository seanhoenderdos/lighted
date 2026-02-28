import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Secret key to authenticate requests from n8n
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET;

// POST /api/briefs - Create a new brief (called by n8n)
export async function POST(request: NextRequest) {
  try {
    // Verify the webhook secret
    const authHeader = request.headers.get('authorization');
    if (!N8N_WEBHOOK_SECRET || authHeader !== `Bearer ${N8N_WEBHOOK_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    const {
      telegramChatId,
      telegramMessageId,
      audioFileId,
      audioDuration,
      title,
      description,
      originalTranscript,
      greekInsights,
      historicalContext,
      outlinePoints,
      category,
    } = body;

    // Find the user by their linked Telegram chat ID
    let user = await prisma.user.findUnique({
      where: { telegramChatId: String(telegramChatId) }
    });

    // If no user is linked, create a placeholder user
    // They will claim this brief when they sign in via the magic link
    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramChatId: String(telegramChatId),
          name: `Telegram User ${telegramChatId}`,
        }
      });
    }

    // Calculate estimated read time (roughly 200 words per minute)
    const wordCount = [
      originalTranscript,
      historicalContext,
      JSON.stringify(greekInsights),
      JSON.stringify(outlinePoints)
    ].filter(Boolean).join(' ').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // Detect category from title/content if not provided
    const detectedCategory = category || detectCategory(title, originalTranscript);

    // Create the brief
    const brief = await prisma.brief.create({
      data: {
        userId: user.id,
        telegramChatId: String(telegramChatId),
        telegramMessageId: String(telegramMessageId),
        audioFileId,
        audioDuration,
        title,
        description,
        originalTranscript,
        greekInsights,
        historicalContext,
        outlinePoints,
        category: detectedCategory,
        readTime,
        status: 'in-progress',
      }
    });

    // Return the brief URL for the Telegram bot to send
    const briefUrl = `${process.env.NEXTAUTH_URL}/brief/${brief.id}`;

    return NextResponse.json({
      success: true,
      briefId: brief.id,
      briefUrl,
      message: 'Brief created successfully'
    });

  } catch (error) {
    console.error('Error creating brief:', error);
    return NextResponse.json(
      { error: 'Failed to create brief' },
      { status: 500 }
    );
  }
}

// GET /api/briefs - Get briefs for authenticated user
export async function GET(request: NextRequest) {
  try {
    // Get user from session (for web app requests)
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const telegramChatId = searchParams.get('telegramChatId');

    let whereClause = {};
    
    if (userId) {
      whereClause = { userId };
    } else if (telegramChatId) {
      whereClause = { telegramChatId };
    } else {
      return NextResponse.json({ error: 'Missing userId or telegramChatId' }, { status: 400 });
    }

    const briefs = await prisma.brief.findMany({
      where: whereClause,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        category: true,
        readTime: true,
        isBookmarked: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({ briefs });

  } catch (error) {
    console.error('Error fetching briefs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch briefs' },
      { status: 500 }
    );
  }
}

// Helper function to detect category from content
function detectCategory(title: string, transcript?: string): string {
  const content = `${title} ${transcript || ''}`.toLowerCase();
  
  // Old Testament books
  const oldTestamentBooks = [
    'genesis', 'exodus', 'leviticus', 'numbers', 'deuteronomy',
    'joshua', 'judges', 'ruth', 'samuel', 'kings', 'chronicles',
    'ezra', 'nehemiah', 'esther', 'job', 'psalm', 'proverbs',
    'ecclesiastes', 'song of solomon', 'isaiah', 'jeremiah',
    'lamentations', 'ezekiel', 'daniel', 'hosea', 'joel', 'amos',
    'obadiah', 'jonah', 'micah', 'nahum', 'habakkuk', 'zephaniah',
    'haggai', 'zechariah', 'malachi'
  ];
  
  // New Testament books
  const newTestamentBooks = [
    'matthew', 'mark', 'luke', 'john', 'acts', 'romans',
    'corinthians', 'galatians', 'ephesians', 'philippians',
    'colossians', 'thessalonians', 'timothy', 'titus', 'philemon',
    'hebrews', 'james', 'peter', 'jude', 'revelation'
  ];

  for (const book of oldTestamentBooks) {
    if (content.includes(book)) return 'old-testament';
  }
  
  for (const book of newTestamentBooks) {
    if (content.includes(book)) return 'new-testament';
  }
  
  return 'topical';
}
