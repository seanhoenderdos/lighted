import { NextRequest, NextResponse } from 'next/server';
import { detectBibleReferences } from '@/ai/ai-instance';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text content is required' }, { status: 400 });
    }

    const references = await detectBibleReferences(text);
    
    return NextResponse.json({ references });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}