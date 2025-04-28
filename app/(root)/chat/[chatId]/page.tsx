'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SermonForm from '@/components/forms/SermonForm';
import { useChat } from '@/context/ChatProvider';
import ROUTES from '@/constants/routes';
import LoadingIndicator from '@/components/chat/LoadingIndicator';

interface ChatPageProps {
  params: {
    chatId: string;
  };
}

export default function ChatPage({ params }: ChatPageProps) {
  const { loadChat, navigateToNewChat, loadingChat } = useChat();
  const router = useRouter();
  const chatId = params.chatId;
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    async function fetchChat() {
      // This will load the chat from localStorage
      const chat = await loadChat(chatId);
      
      if (!chat) {
        // Chat not found in localStorage, redirect to chat home
        router.push(ROUTES.CHAT.HOME);
        return;
      }
      
      setIsLoaded(true);
    }
    
    fetchChat();
  }, [chatId, loadChat, router]);
  
  // Show loading while fetching chat data
  if (!isLoaded || loadingChat) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
        <LoadingIndicator />
        <p className="mt-4 text-muted-foreground">Loading chat...</p>
      </div>
    );
  }
  
  // Show the SermonForm with the chat ID
  return (
    <SermonForm
      key={chatId}
      chatId={chatId}
      onBackToChats={() => router.push(ROUTES.CHAT.HOME)}
      onNewChat={navigateToNewChat}
    />
  );
}