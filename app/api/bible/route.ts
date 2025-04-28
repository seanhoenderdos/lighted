import { NextRequest, NextResponse } from 'next/server';
import { getBibleVerse } from '@/lib/bible-service';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Bible reference is required' }, { status: 400 });
  }

  try {
    const verseData = await getBibleVerse(reference);
    return NextResponse.json(verseData);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}