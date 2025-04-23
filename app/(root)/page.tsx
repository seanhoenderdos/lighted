'use client'

import React, { useState } from 'react';
import SermonForm from "@/components/forms/SermonForm";
import ChatHome from "@/components/chat/ChatHome";

const Home = () => {
  // State to manage which screen to show
  const [activeScreen, setActiveScreen] = useState<'home' | 'chat'>('home');
  // State to store any initial message when starting a new chat
  const [initialMessage, setInitialMessage] = useState<string | undefined>();
  // State to store the active chat ID (for loading existing chats)
  const [activeChatId, setActiveChatId] = useState<string | undefined>();

  // Handler for starting a new chat
  const handleStartNewChat = (message?: string) => {
    setInitialMessage(message);
    setActiveChatId(undefined);
    setActiveScreen('chat');
  };

  // Handler for returning to the chat home screen
  const handleBackToChats = () => {
    setActiveScreen('home');
  };

  // Handler for selecting an existing chat
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setInitialMessage(undefined);
    setActiveScreen('chat');
  };

  // Handler for the "New Chat" button in the active chat view
  const handleNewChat = () => {
    setInitialMessage(undefined);
    setActiveChatId(undefined);
    setActiveScreen('home');
  };

  return (
    <main className="h-full w-full overflow-none">
      {activeScreen === 'home' ? (
        <ChatHome 
          onStartNewChat={handleStartNewChat} 
          onSelectChat={handleSelectChat}
        />
      ) : (
        <SermonForm 
          initialMessage={initialMessage}
          chatId={activeChatId}
          onNewChat={handleNewChat}
          onBackToChats={handleBackToChats}
        />
      )}
    </main>
  );
};

export default Home;
