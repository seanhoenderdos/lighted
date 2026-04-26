import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { transcribeAudio, generateExegesis } from '@/lib/ai';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: briefId } = await params;

    // Verify ownership
    const brief = await prisma.brief.findUnique({
      where: { id: briefId }
    });

    if (!brief) {
      return NextResponse.json({ error: 'Brief not found' }, { status: 404 });
    }

    if (brief.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse the form data
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Convert file to Buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Transcribe audio
    const transcript = await transcribeAudio(buffer, 'recording.webm');
    
    if (!transcript || transcript.trim().length < 5) {
      return NextResponse.json({ error: 'Could not understand audio' }, { status: 400 });
    }

    // 2. Generate insights
    const exegesis = await generateExegesis(transcript);

    // Calculate word count for read time
    const wordCount = [
      transcript,
      exegesis.historicalContext,
      JSON.stringify(exegesis.greekInsights),
      JSON.stringify(exegesis.outlinePoints)
    ].filter(Boolean).join(' ').split(/\s+/).length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    // 3. Update brief
    const updatedBrief = await prisma.brief.update({
      where: { id: briefId },
      data: {
        title: exegesis.title || brief.title,
        originalTranscript: transcript,
        category: exegesis.category,
        greekInsights: exegesis.greekInsights,
        historicalContext: exegesis.historicalContext,
        outlinePoints: exegesis.outlinePoints,
        readTime,
        status: 'in-progress'
      }
    });

    return NextResponse.json({ success: true, brief: updatedBrief });
  } catch (error) {
    console.error('Error processing audio:', error);
    return NextResponse.json(
      { error: 'Failed to process audio recording' },
      { status: 500 }
    );
  }
}
