'use server'

import { auth } from "@/auth";
import type { ChatMessage, ChatSession } from "@/lib/chat-storage";

// This is a server-side wrapper around localStorage functionality
// It uses cookies to bridge some functionality between client and server
// Most operations will still need to be performed client-side

/**
 * Check if a user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * Server action to check if a chat exists (stub for API route)
 * This simply returns true since the actual checking happens on the client
 */
export async function checkChatExists(_chatId: string): Promise<boolean> {
  return true;
}

/**
 * Server-side function to get a chat by ID
 * This is mostly a stub since localStorage is client-only
 */
export async function getChatById(_chatId: string): Promise<ChatSession | null> {
  // Actual implementation will be handled client-side
  return null;
}

/**
 * Server-side function to get all chats
 * This is mostly a stub since localStorage is client-only
 */
export async function getChats(): Promise<ChatSession[]> {
  // Actual implementation will be handled client-side
  return [];
}

/**
 * Create a new chat record (server-side action)
 * In a full implementation, this would save to a database
 * For localStorage approach, we'll just create a temporary chat
 */
export async function createChat(initialMessages: ChatMessage[], title: string): Promise<ChatSession | null> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return null;
  }
  
  // Return a temporary chat object for the client to handle
  // The client will be responsible for saving this to localStorage
  const now = Date.now();
  
  return {
    id: generateTempId(),
    title,
    messages: initialMessages,
    createdAt: now,
    updatedAt: now,
    userId: session.user.id
  };
}

/**
 * Generate a temporary ID (similar to client-side function)
 */
function generateTempId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

/**
 * Server-side wrapper for deleting a chat
 * Returns true to let client handle the actual deletion
 */
export async function deleteChat(_chatId: string): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user?.id) {
    return false;
  }
  
  // Return success and let client handle the actual localStorage deletion
  return true;
}