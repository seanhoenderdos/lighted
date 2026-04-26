import { transcribeAudio, generateExegesis } from './ai';

const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: {
      id: number;
      first_name: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    date: number;
    voice?: {
      duration: number;
      mime_type: string;
      file_id: string;
      file_unique_id: string;
      file_size: number;
    };
    text?: string;
  };
}

export interface TelegramFile {
  file_id: string;
  file_unique_id: string;
  file_size: number;
  file_path: string;
}

/**
 * Send a message to a Telegram chat
 */
export async function sendTelegramMessage(
  chatId: number,
  text: string,
  options?: { parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2' }
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not configured');

  const response = await fetch(`${TELEGRAM_API_URL}${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: options?.parse_mode || 'HTML',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Telegram sendMessage failed: ${error}`);
  }
}

/**
 * Get file info from Telegram (needed to download voice notes)
 */
export async function getTelegramFile(fileId: string): Promise<TelegramFile> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not configured');

  const response = await fetch(`${TELEGRAM_API_URL}${token}/getFile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: fileId }),
  });

  if (!response.ok) {
    throw new Error('Failed to get file info from Telegram');
  }

  const data = await response.json();
  return data.result as TelegramFile;
}

/**
 * Download a file from Telegram servers
 */
export async function downloadTelegramFile(filePath: string): Promise<Buffer> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN not configured');

  const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
  const response = await fetch(fileUrl);

  if (!response.ok) {
    throw new Error('Failed to download file from Telegram');
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export { transcribeAudio, generateExegesis };
