'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SermonForm from "@/components/forms/SermonForm";
import ChatHome from "@/components/chat/ChatHome";
import { useChat } from '@/context/ChatProvider'; // Import the chat context hook

const Home = () => {
  const _router = useRouter(); // Prefixed with underscore to indicate intentionally unused
  // State to manage which screen to show
  const [activeScreen, setActiveScreen] = useState<'home' | 'chat'>('home');
  // State to store any initial message when starting a new chat
  const [initialMessage, setInitialMessage] = useState<string | undefined>();
  // State to store the active chat ID (for loading existing chats)
  const [activeChatId, setActiveChatId] = useState<string | undefined>();
  // State for sermon options
  const [denomination, setDenomination] = useState<string>('non-denominational');
  const [activeTab, setActiveTab] = useState<'sermon' | 'exegesis' | 'counseling'>('sermon');
  // Get the chat loading function from context
  const { loadChats } = useChat();

  // Listen for new chat requests from the navbar
  useEffect(() => {
    const handleNewChatRequest = () => {
      setInitialMessage(undefined);
      setActiveChatId(undefined);
      setActiveScreen('home');
    };

    window.addEventListener('newChatRequested', handleNewChatRequest);
    
    return () => {
      window.removeEventListener('newChatRequested', handleNewChatRequest);
    };
  }, []);

  // Handler for starting a new chat
  const handleStartNewChat = (message?: string, options?: { 
    denomination?: string; 
    activeTab?: 'sermon' | 'exegesis' | 'counseling' 
  }) => {
    setInitialMessage(message);
    
    // Save selected options
    if (options?.denomination) {
      setDenomination(options.denomination);
    }
    if (options?.activeTab) {
      setActiveTab(options.activeTab);
    }
    
    // Create a temporary chat (URL will be updated once chat is saved)
    setActiveChatId(undefined);
    setActiveScreen('chat');
  };

  // Handler for returning to the chat home screen
  const handleBackToChats = () => {
    // Refresh chats before showing the home screen
    loadChats().then(() => {
      setActiveScreen('home');
    });
  };

  // Handler for selecting an existing chat
  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setInitialMessage(undefined);
    setActiveScreen('chat');
  };

  // Handler for the "New Chat" button in the active chat view
  const handleNewChat = () => {
    // Refresh chats before showing the home screen
    loadChats().then(() => {
      setInitialMessage(undefined);
      setActiveChatId(undefined);
      setActiveScreen('home');
    });
  };

  // Refresh chats whenever we return to the home screen
  useEffect(() => {
    if (activeScreen === 'home') {
      loadChats();
    }
  }, [activeScreen, loadChats]);

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
          denomination={denomination}
          activeTab={activeTab}
        />
      )}
    </main>
  );
};

export default Home;
