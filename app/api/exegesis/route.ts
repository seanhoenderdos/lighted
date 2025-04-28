import { NextRequest, NextResponse } from 'next/server';
import { generateExegesis } from '@/ai/ai-instance';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { passage, denomination = 'non-denominational' } = body;

    if (!passage) {
      return NextResponse.json({ error: 'Bible passage is required' }, { status: 400 });
    }

    const result = await generateExegesis(passage, denomination);
    return NextResponse.json(result);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}