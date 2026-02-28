import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  TelegramUpdate,
  sendTelegramMessage,
  getTelegramFile,
  downloadTelegramFile,
  transcribeAudio,
  generateExegesis,
} from '@/lib/telegram';

// Verify the webhook is from Telegram (optional but recommended)
const TELEGRAM_WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify webhook secret if configured
    if (TELEGRAM_WEBHOOK_SECRET) {
      const secretHeader = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (secretHeader !== TELEGRAM_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const update: TelegramUpdate = await request.json();
    const message = update.message;

    // Ignore non-message updates
    if (!message) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const telegramUserId = message.from.id.toString();

    // Handle /start command - welcome message
    if (message.text?.startsWith('/start')) {
      await sendTelegramMessage(
        chatId,
        `Welcome to <b>Lighted</b>! ✨\n\nSend me a voice note with your sermon topic, scripture passage, or theological question, and I'll generate an exegesis brief for you.\n\nYour briefs will be available at ${process.env.NEXTAUTH_URL}/briefs after you link your account.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle /link command - account linking
    if (message.text?.startsWith('/link')) {
      const linkUrl = `${process.env.NEXTAUTH_URL}/link-telegram?chatId=${chatId}`;
      await sendTelegramMessage(
        chatId,
        `To link your Telegram account with Lighted, click here:\n\n${linkUrl}\n\nAfter linking, all your briefs will appear in your library.`
      );
      return NextResponse.json({ ok: true });
    }

    // Handle voice notes
    if (message.voice) {
      // Send immediate acknowledgment
      await sendTelegramMessage(
        chatId,
        '🎙️ Got your voice note! Processing...\n\nThis usually takes 30-60 seconds.'
      );

      try {
        // 1. Download the voice note
        const fileInfo = await getTelegramFile(message.voice.file_id);
        const audioBuffer = await downloadTelegramFile(fileInfo.file_path);

        // 2. Transcribe with Groq Whisper
        const transcript = await transcribeAudio(audioBuffer, 'voice.ogg');

        if (!transcript || transcript.trim().length < 10) {
          await sendTelegramMessage(
            chatId,
            "❌ I couldn't understand the audio. Please try again with a clearer recording."
          );
          return NextResponse.json({ ok: true });
        }

        // 3. Generate exegesis with Groq LLM
        const exegesis = await generateExegesis(transcript);

        // 4. Find or create user based on Telegram ID
        let user = await prisma.user.findFirst({
          where: { telegramChatId: telegramUserId },
        });

        // If no linked account, create a placeholder user for this Telegram ID
        if (!user) {
          user = await prisma.user.create({
            data: {
              telegramChatId: telegramUserId,
              name: message.from.first_name || 'Telegram User',
              // No email - this is a "ghost" account that will be linked later
            },
          });
        }

        // 5. Save the brief
        const brief = await prisma.brief.create({
          data: {
            userId: user.id,
            title: exegesis.title,
            originalTranscript: transcript,
            category: exegesis.category,
            greekInsights: exegesis.greekInsights,
            historicalContext: exegesis.historicalContext,
            outlinePoints: exegesis.outlinePoints,
            telegramMessageId: String(message.message_id),
            telegramChatId: String(chatId),
            status: 'completed',
          },
        });

        // 6. Send success message with link
        const briefUrl = `${process.env.NEXTAUTH_URL}/brief/${brief.id}`;
        await sendTelegramMessage(
          chatId,
          `✅ <b>Your brief is ready!</b>\n\n📖 <b>${exegesis.title}</b>\n\nView and export your exegesis:\n${briefUrl}\n\n💡 Use /link to connect your Lighted account and access all your briefs from the web.`
        );
      } catch (error) {
        console.error('Voice processing error:', error);
        await sendTelegramMessage(
          chatId,
          '❌ Something went wrong processing your voice note. Please try again later.'
        );
      }

      return NextResponse.json({ ok: true });
    }

    // Handle other text messages
    if (message.text) {
      await sendTelegramMessage(
        chatId,
        '🎤 Please send a <b>voice note</b> with your sermon topic or scripture passage.\n\nI work best with spoken thoughts rather than text!'
      );
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    // Always return 200 to Telegram to prevent retries
    return NextResponse.json({ ok: true });
  }
}

// GET endpoint to verify webhook is working
export async function GET() {
  return NextResponse.json({ 
    status: 'Telegram webhook active',
    configured: !!process.env.TELEGRAM_BOT_TOKEN,
  });
}
