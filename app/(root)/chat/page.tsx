'use client'

import React, { useEffect } from 'react';
import ChatHome from '@/components/chat/ChatHome';
import { useChat } from '@/context/ChatProvider';
import { useAuth } from '@/lib/client-auth';
import { generateChatTitle } from '@/lib/chat-storage';

export default function ChatPage() {
  const { navigateToChat, createChat, loadChats } = useChat();
  const { isLoading } = useAuth(); // Removed unused 'isAuthenticated' variable
  
  // Load chat list when the page loads
  useEffect(() => {
    loadChats();
  }, [loadChats]);
  
  const handleStartNewChat = async (message?: string, _options?: { // Added underscore to unused parameter
    denomination?: string; 
    activeTab?: 'sermon' | 'exegesis' | 'counseling' 
  }) => {
    if (message) {
      const initialMessages = [
        { role: 'system' as const, content: 'You are a helpful assistant for pastoral work.' },
        { role: 'user' as const, content: message }
      ];
      
      // Generate a title based on the first few words of the message
      const title = generateChatTitle(initialMessages);
      
      // Create a new chat in localStorage
      const newChat = await createChat(initialMessages, title);
      
      if (newChat) {
        // Navigate to the specific chat URL
        navigateToChat(newChat.id);
      }
    }
  };
  
  const handleSelectChat = (chatId: string) => {
    // Simply navigate to the chat URL
    navigateToChat(chatId);
  };
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <ChatHome 
      onStartNewChat={handleStartNewChat}
      onSelectChat={handleSelectChat}
    />
  );
}