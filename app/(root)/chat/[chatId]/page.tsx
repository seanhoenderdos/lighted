import { ChatClient } from './chat-client';

// Server component receives the params as a Promise in Next.js 15
export default async function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  // Await and extract the chatId from params
  const resolvedParams = await params;
  const chatId = resolvedParams.chatId;
  
  // Pass the resolved chatId to the client component
  return <ChatClient chatId={chatId} />;
}