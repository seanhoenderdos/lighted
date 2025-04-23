'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { getAllChats, ChatSession, deleteChat, isAuthenticated } from '@/lib/chat-storage';
import { formatDistanceToNow } from 'date-fns';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { Card } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import ChatInput from '@/components/chat/ChatInput';
import ChatSuggestions from '@/components/chat/ChatSuggestions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ROUTES from '@/constants/routes';

// Fallback suggestions in case API call fails
const FALLBACK_SUGGESTIONS = [
  "What scriptures speak about God's faithfulness?",
  "How do I explain salvation to children?",
  "Create a sermon series on the Beatitudes",
  "Find illustrations for a message on prayer"
];

const ChatHome = ({ onStartNewChat, onSelectChat }: {
  onStartNewChat: (initialMessage?: string) => void;
  onSelectChat: (chatId: string) => void;
}) => {
  const [input, setInput] = useState('');
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Get session data once without triggering re-renders
  const { data: session, status } = useSession({ required: false });
  const [username, setUsername] = useState('Guest');
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  
  // Check if user has dismissed the sign-in prompt
  const [hasUserDismissedPrompt, setHasUserDismissedPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dismissed_signin_prompt') === 'true';
    }
    return false;
  });

  // Fetch AI-generated suggestions with cache-busting
  const fetchSuggestions = useCallback(async () => {
    try {
      setIsSuggestionsLoading(true);
      setApiError(null);
      
      // Ensure we have a fresh request each time by using direct fetch API
      const timestamp = new Date().getTime();
      const random = Math.random().toString(36).substring(2, 10);
      const uniqueUrl = `/api/suggestions?count=7&nocache=${timestamp}-${random}`;
      
      console.log(`Fetching suggestions from: ${uniqueUrl}`);
      
      const response = await fetch(uniqueUrl, { 
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API error (${response.status}): ${errorText}`);
        throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      // Check if data.suggestions is an array - this is the proper format
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        console.log(`Setting ${data.suggestions.length} new suggestions:`, data.suggestions);
        // Only use string suggestions to prevent the React child error
        const stringOnlySuggestions = data.suggestions.filter(
          (suggestion: unknown): suggestion is string => typeof suggestion === 'string'
        );
        setSuggestions(stringOnlySuggestions);
      } else {
        console.warn('No suggestions returned from API, using fallbacks');
        setSuggestions(FALLBACK_SUGGESTIONS);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to load suggestions');
      setSuggestions(FALLBACK_SUGGESTIONS);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, []);

  // Create a memoized function to load chats
  const loadChats = useCallback(async () => {
    if (isUserAuthenticated) {
      setChats(getAllChats());
    } else {
      setChats([]);
    }
  }, [isUserAuthenticated]);

  // Check auth status only once when status changes
  useEffect(() => {
    if (status === 'loading') return;
    
    const checkAuthStatus = async () => {
      try {
        const authStatus = await isAuthenticated();
        setIsUserAuthenticated(authStatus);
        
        if (status === 'authenticated' && session?.user?.name) {
          setUsername(session.user.name);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuthStatus();
  }, [status, session?.user?.name]);
  
  // Load chats only when auth status changes
  useEffect(() => {
    loadChats();
  }, [isUserAuthenticated, loadChats]);

  // Fetch suggestions when component mounts
  useEffect(() => {
    console.log('Initializing suggestions...');
    // Set loading state immediately to improve UX
    setIsSuggestionsLoading(true);
    // Brief timeout to ensure consistent loading state display
    setTimeout(() => {
      fetchSuggestions();
    }, 100);
    
    return () => {
      // Clean up
      setApiError(null);
    };
  }, [fetchSuggestions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Check if we need to show the sign-in prompt
      if (!isUserAuthenticated && !hasUserDismissedPrompt) {
        setShowSignInPrompt(true);
        return;
      }
      
      // Otherwise proceed with creating the chat
      onStartNewChat(input);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    // Check if we need to show the sign-in prompt
    if (!isUserAuthenticated && !hasUserDismissedPrompt) {
      setInput(suggestion);
      setShowSignInPrompt(true);
      return;
    }
    
    // Otherwise proceed with creating the chat
    onStartNewChat(suggestion);
  };

  const handleProceedWithoutSignIn = () => {
    // Save the user's preference
    localStorage.setItem('dismissed_signin_prompt', 'true');
    setHasUserDismissedPrompt(true);
    setShowSignInPrompt(false);
    
    // Now proceed with the chat
    if (input.trim()) {
      onStartNewChat(input);
    }
  };

  // Format the timestamp for display
  const formatTimestamp = (timestamp: number): string => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent chat selection
    setChatToDelete(chatId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm chat deletion
  const handleConfirmDelete = async () => {
    if (chatToDelete) {
      const isDeleted = await deleteChat(chatToDelete);
      
      if (isDeleted) {
        // Only refresh the chat list if the delete was successful
        loadChats();
      }
      
      setIsDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-background dark:bg-background transition-colors duration-300 overflow-x-hidden">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-4xl mx-auto w-full px-4 py-8 overflow-hidden">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-medium mb-2">
              Hi, <span className="username-glow">{username}</span>
            </h1>
          </div>

          {/* Suggestions with loading state - refresh button removed */}
          {isSuggestionsLoading ? (
            <div className="flex flex-col space-y-3 my-6 px-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-navy-900/30 animate-pulse rounded-full border border-navy-700/30"></div>
              ))}
            </div>
          ) : apiError ? (
            <div className="text-center my-8 text-muted-foreground">
              <p className="mb-2">{apiError}</p>
              <Button variant="outline" size="sm" onClick={fetchSuggestions}>
                Try Again
              </Button>
            </div>
          ) : (
            <ChatSuggestions 
              suggestions={suggestions}
              onSelectSuggestion={handleSuggestionClick}
              maxSuggestions={3}
              variant="home"
            />
          )}

          {/* ChatInput above sermon history */}
          <div className="my-8">
            <ChatInput 
              input={input}
              setInput={setInput}
              onSubmit={handleSubmit}
              placeholder="What would you like assistance with?"
              isFixed={false}
              showDisclaimer={true}
            />
          </div>

          {/* Recent sermons - Only shown if there are sermons and user is authenticated */}
          {isUserAuthenticated && chats.length > 0 && (
            <div className="mt-12">
              <h2 className="text-lg font-medium mb-4">History</h2>
              <div className="flex flex-col gap-2.5">
                {chats.map((chat) => (
                  <Card
                    key={chat.id}
                    className="relative group border border-border hover:border-ring transition-colors duration-200 overflow-hidden"
                  >
                    <button
                      onClick={() => onSelectChat(chat.id)}
                      className="w-full flex flex-col p-4 text-left hover:bg-accent/20 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium pr-8">{chat.title}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(chat.updatedAt)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {chat.messages[chat.messages.length - 1]?.content || 'Empty sermon'}
                      </p>
                    </button>
                    
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteClick(chat.id, e)}
                      className="absolute right-3 top-3 p-1.5 rounded-md bg-background/80 dark:bg-background/40 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Delete sermon"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign-in modal - only show when needed */}
      {showSignInPrompt && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background dark:bg-background/90 border border-border rounded-lg p-6 max-w-md w-full shadow-lg">
            <div className="mb-4 flex justify-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600 dark:text-blue-300">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Sign in to save your sermons</h3>
            <p className="text-muted-foreground text-center mb-5">
              Create an account to save your sermons and access them from any device.
            </p>
            
            <div className="flex flex-col gap-3">
              <Link href={ROUTES.SIGN_IN} className="w-full">
                <Button className="w-full">Sign In</Button>
              </Link>
              <Link href={ROUTES.SIGN_UP} className="w-full">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="mt-2"
                onClick={handleProceedWithoutSignIn}
              >
                Proceed without signing in
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Sermon"
        message="Are you sure you want to delete this sermon? This action cannot be undone."
      />

      {/* Add CSS for username glow effect */}
      <style jsx global>{`
        .username-glow {
          display: inline-block;
          position: relative;
          color: #14b8a6;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% {
            text-shadow: 0 0 5px rgba(20, 184, 166, 0.3);
          }
          50% {
            text-shadow: 0 0 15px rgba(20, 184, 166, 0.7), 0 0 20px rgba(20, 184, 166, 0.5);
          }
          100% {
            text-shadow: 0 0 5px rgba(20, 184, 166, 0.3);
          }
        }
        
        :root.dark .username-glow {
          color: white;
        }
        
        :root.dark .username-glow {
          animation: pulse-dark 2s infinite;
        }
        
        @keyframes pulse-dark {
          0% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
          }
          50% {
            text-shadow: 0 0 15px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.5);
          }
          100% {
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatHome;