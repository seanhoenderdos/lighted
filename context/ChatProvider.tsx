'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/client-auth';
import { 
  ChatMessage, 
  ChatSession, 
  getAllChats, 
  getChatById as getLocalChatById,
  createChat as createLocalChat,
  updateChatMessages as updateLocalChatMessages,
  deleteChat as deleteLocalChat,
  cleanupDuplicateChats
} from '@/lib/chat-storage';
import ROUTES from '@/constants/routes';

// Define context types
type ChatContextType = {
  chats: ChatSession[];
  currentChat: ChatSession | null;
  loadingChats: boolean;
  loadingChat: boolean;
  savingChat: boolean;
  loadChats: () => Promise<void>;
  loadChat: (chatId: string) => Promise<ChatSession | null>;
  createChat: (messages: ChatMessage[], title: string) => Promise<ChatSession | null>;
  updateChatMessages: (chatId: string, messages: ChatMessage[]) => Promise<boolean>;
  deleteChat: (chatId: string) => Promise<boolean>;
  navigateToChat: (chatId: string) => void;
  navigateToNewChat: () => void;
};

// Create the context
const ChatContext = createContext<ChatContextType>({
  chats: [],
  currentChat: null,
  loadingChats: false,
  loadingChat: false,
  savingChat: false,
  loadChats: async () => { /* Default empty implementation */ },
  loadChat: async () => null,
  createChat: async () => null,
  updateChatMessages: async () => false,
  deleteChat: async () => false,
  navigateToChat: () => { /* Default empty implementation */ },
  navigateToNewChat: () => { /* Default empty implementation */ },
});

// Create the provider component
export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatSession | null>(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [savingChat, setSavingChat] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  // Load all chats from localStorage
  const loadChats = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    setLoadingChats(true);
    try {
      // Use the client-side function to get chats from localStorage
      const localChats = getAllChats();
      setChats(localChats);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoadingChats(false);
    }
  }, []);
  
  // Load a specific chat from localStorage
  const loadChat = useCallback(async (chatId: string) => {
    if (typeof window === 'undefined') return null;
    
    setLoadingChat(true);
    try {
      // Use the client-side function to get a chat from localStorage
      const chat = getLocalChatById(chatId);
      setCurrentChat(chat);
      return chat;
    } catch (error) {
      console.error('Error loading chat:', error);
      return null;
    } finally {
      setLoadingChat(false);
    }
  }, []);
  
  // Create a new chat and save it to localStorage
  const createNewChat = useCallback(async (messages: ChatMessage[], title: string) => {
    if (typeof window === 'undefined') return null;
    
    setSavingChat(true);
    try {
      // Use the client-side function to create a new chat in localStorage
      const newChat = await createLocalChat(messages, title);
      
      if (newChat) {
        await loadChats(); // Refresh the chat list
        setCurrentChat(newChat);
      }
      return newChat;
    } catch (error) {
      console.error('Error creating chat:', error);
      return null;
    } finally {
      setSavingChat(false);
    }
  }, [loadChats]);
  
  // Update messages in a chat and save to localStorage
  const updateChatMessages = useCallback(async (chatId: string, messages: ChatMessage[]) => {
    if (typeof window === 'undefined') return false;
    
    setSavingChat(true);
    try {
      // Use the client-side function to update chat messages in localStorage
      const updatedChat = await updateLocalChatMessages(chatId, messages);
      
      if (updatedChat) {
        await loadChats(); // Refresh the chat list
        setCurrentChat(updatedChat);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating chat messages:', error);
      return false;
    } finally {
      setSavingChat(false);
    }
  }, [loadChats]);
  
  // Delete a chat from localStorage
  const deleteSelectedChat = useCallback(async (chatId: string) => {
    if (typeof window === 'undefined') return false;
    
    try {
      // Use the client-side function to delete a chat from localStorage
      const success = await deleteLocalChat(chatId);
      
      if (success) {
        await loadChats(); // Refresh the chat list
        if (currentChat?.id === chatId) {
          setCurrentChat(null);
        }
      }
      return success;
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }, [currentChat, loadChats]);
  
  // Navigation helpers that use Next.js router
  const navigateToChat = useCallback((chatId: string) => {
    router.push(ROUTES.CHAT.CONVERSATION(chatId));
  }, [router]);
  
  const navigateToNewChat = useCallback(() => {
    router.push(ROUTES.CHAT.HOME);
  }, [router]);
  
  // Load chats on mount and when authentication status changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialize = async () => {
        // First clean up any duplicate chats
        if (isAuthenticated) {
          try {
            await cleanupDuplicateChats();
          } catch (error) {
            console.error('Error cleaning up duplicate chats:', error);
          }
        }
        // Then load the chats
        loadChats();
      };
      
      initialize();
    }
  }, [loadChats, isAuthenticated]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        currentChat,
        loadingChats,
        loadingChat,
        savingChat,
        loadChats,
        loadChat,
        createChat: createNewChat,
        updateChatMessages,
        deleteChat: deleteSelectedChat,
        navigateToChat,
        navigateToNewChat
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

// Create a hook for using the chat context
export const useChat = () => useContext(ChatContext);