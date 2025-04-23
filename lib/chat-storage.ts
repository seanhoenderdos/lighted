// Chat storage utility functions for managing chat history in localStorage
import { getSession } from 'next-auth/react';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  userId?: string; // Optional field to associate chats with users
}

const STORAGE_KEY = 'lighted-chat-history';

/**
 * Check if a user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const session = await getSession();
    return !!session?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

/**
 * Generate a unique ID for new chat sessions
 */
const generateChatId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Get all stored chat sessions
 */
export const getAllChats = (): ChatSession[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedChats = localStorage.getItem(STORAGE_KEY);
    if (!storedChats) return [];
    return JSON.parse(storedChats);
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return [];
  }
};

/**
 * Get a specific chat by ID
 */
export const getChatById = (chatId: string): ChatSession | null => {
  const chats = getAllChats();
  return chats.find(chat => chat.id === chatId) || null;
};

/**
 * Create a new chat session
 * Returns the new chat if successful, or null if user is not authenticated
 */
export const createChat = async (
  initialMessages: ChatMessage[], 
  title = 'New Conversation'
): Promise<ChatSession | null> => {
  // Check if user is authenticated
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    console.log('Cannot save sermon: User not authenticated');
    return null;
  }

  const chats = getAllChats();
  const now = Date.now();
  
  // Get user session to associate the chat with the user
  const session = await getSession();
  
  const newChat: ChatSession = {
    id: generateChatId(),
    title,
    messages: initialMessages,
    createdAt: now,
    updatedAt: now,
    userId: session?.user?.id
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newChat, ...chats]));
  return newChat;
};

/**
 * Update an existing chat session
 * Returns the updated chat if successful, or null if user is not authenticated
 */
export const updateChat = async (chatId: string, updates: Partial<ChatSession>): Promise<ChatSession | null> => {
  // Check if user is authenticated
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    console.log('Cannot update sermon: User not authenticated');
    return null;
  }
  
  const chats = getAllChats();
  const chatIndex = chats.findIndex(chat => chat.id === chatId);
  
  if (chatIndex === -1) return null;
  
  const updatedChat = {
    ...chats[chatIndex],
    ...updates,
    updatedAt: Date.now()
  };
  
  chats[chatIndex] = updatedChat;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  
  return updatedChat;
};

/**
 * Update messages in a chat session
 * Returns the updated chat if successful, or null if user is not authenticated
 */
export const updateChatMessages = async (chatId: string, messages: ChatMessage[]): Promise<ChatSession | null> => {
  return updateChat(chatId, { messages });
};

/**
 * Delete a chat by ID
 */
export const deleteChat = async (chatId: string): Promise<boolean> => {
  // Check if user is authenticated
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    console.log('Cannot delete sermon: User not authenticated');
    return false;
  }
  
  const chats = getAllChats();
  const filteredChats = chats.filter(chat => chat.id !== chatId);
  
  if (filteredChats.length === chats.length) {
    return false; // No chat was deleted
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredChats));
  return true;
};

/**
 * Generate a title for a chat based on its contents
 * This uses a simple heuristic but could be replaced with an AI-generated title
 */
export const generateChatTitle = (messages: ChatMessage[]): string => {
  // Find the first user message
  const firstUserMessage = messages.find(msg => msg.role === 'user');
  
  if (!firstUserMessage) return 'New Conversation';
  
  // Take the first few words or characters, whichever is shorter
  const content = firstUserMessage.content.trim();
  const words = content.split(' ').slice(0, 5).join(' ');
  
  if (words.length < 30) {
    return words + (words.length < content.length ? '...' : '');
  } else {
    return content.substring(0, 30) + '...';
  }
};

/**
 * Clear all chat history
 */
export const clearAllChats = async (): Promise<boolean> => {
  // Check if user is authenticated
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    console.log('Cannot clear sermons: User not authenticated');
    return false;
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return true;
};

/**
 * Get a temporary session for non-authenticated users
 * This will not be saved to localStorage
 */
export const getTempChatSession = (messages: ChatMessage[]): ChatSession => {
  return {
    id: 'temp-' + generateChatId(),
    title: generateChatTitle(messages),
    messages,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
};