import { NextRequest, NextResponse } from 'next/server';
import { generateCounselingGuidance } from '@/ai/ai-instance';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { situation, denominationContext = 'non-denominational' } = body;

    if (!situation) {
      return NextResponse.json({ error: 'Counseling situation is required' }, { status: 400 });
    }

    const result = await generateCounselingGuidance(situation, denominationContext);
    return NextResponse.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}