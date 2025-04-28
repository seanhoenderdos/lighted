'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import DeleteConfirmDialog from '@/components/ui/delete-confirm-dialog';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/client-auth';
import ChatInput from '@/components/chat/ChatInput';
import ChatSuggestions from '@/components/chat/ChatSuggestions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import ROUTES from '@/constants/routes';
import { useChat } from '@/context/ChatProvider';

// Fallback suggestions in case API call fails
const FALLBACK_SUGGESTIONS = [
  "What scriptures speak about God's faithfulness?",
  "How do I explain salvation to children?",
  "Create a sermon series on the Beatitudes",
  "Find illustrations for a message on prayer"
];

const ChatHome = ({ onStartNewChat, onSelectChat }: {
  onStartNewChat: (initialMessage?: string, options?: { denomination?: string; activeTab?: 'sermon' | 'exegesis' | 'counseling' }) => void;
  onSelectChat: (chatId: string) => void;
}) => {
  const [input, setInput] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [hasUserDismissedPrompt, setHasUserDismissedPrompt] = useState(false);
  const [username, setUsername] = useState('Guest');

  // State for sermon options
  const [denomination, setDenomination] = useState<string>('non-denominational');
  const [activeTab, setActiveTab] = useState<'sermon' | 'exegesis' | 'counseling'>('sermon');

  // Get user session using our auth hook
  const { isAuthenticated, user, status } = useAuth();
  
  // Get chats from our chat context
  const { chats, deleteChat: deleteContextChat } = useChat();

  // Reference to track component mounting state
  const isMountedRef = React.useRef(false);
  const prevValuesRef = React.useRef({ denomination, activeTab });

  // Fetch suggestions from the API
  const fetchSuggestions = useCallback(async () => {
    setIsSuggestionsLoading(true);
    setApiError(null);
    
    try {
      // Ensure we have a fresh request each time by using direct fetch API
      const timestamp = new Date().getTime();
      const random = Math.random().toString(36).substring(2, 10);
      const uniqueUrl = `/api/suggestions?count=7&nocache=${timestamp}-${random}&denomination=${denomination}&activeTab=${activeTab}`;
      
      const response = await fetch(uniqueUrl, { 
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache',
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if data.suggestions is an array
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        setSuggestions(FALLBACK_SUGGESTIONS);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setApiError('Unable to load suggestions. Please try again.');
      setSuggestions(FALLBACK_SUGGESTIONS);
    } finally {
      setIsSuggestionsLoading(false);
    }
  }, [denomination, activeTab]);
  
  // Update suggestions when dropdown values change
  useEffect(() => {
    // Skip the initial render
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    // Only fetch if dropdown values actually changed
    const prevValues = prevValuesRef.current;
    if (prevValues.denomination !== denomination || prevValues.activeTab !== activeTab) {
      // Update ref with current values
      prevValuesRef.current = { denomination, activeTab };
      
      // Only fetch if not already loading
      if (!isSuggestionsLoading) {
        fetchSuggestions();
      }
    }
  }, [denomination, activeTab, isSuggestionsLoading, fetchSuggestions]);

  // Check auth status when status changes
  useEffect(() => {
    if (status === 'loading') return;
    
    if (status === 'authenticated' && user?.name) {
      setUsername(user.name);
    }
    
    // Check if user has dismissed sign-in prompt before
    if (typeof window !== 'undefined') {
      setHasUserDismissedPrompt(localStorage.getItem('dismissed_signin_prompt') === 'true');
    }

    // Fetch initial suggestions
    fetchSuggestions();
  }, [status, user?.name, fetchSuggestions]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Check if we need to show the sign-in prompt
      if (!isAuthenticated && !hasUserDismissedPrompt) {
        setShowSignInPrompt(true);
        return;
      }
      
      // Otherwise proceed with creating the chat
      onStartNewChat(input, { denomination, activeTab });
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    // Set the input first for better UX
    setInput(suggestion);
    
    // Check if we need to show the sign-in prompt
    if (!isAuthenticated && !hasUserDismissedPrompt) {
      setShowSignInPrompt(true);
      return;
    }
    
    // Otherwise proceed with creating the chat
    onStartNewChat(suggestion, { denomination, activeTab });
  };

  // Handle continuing without signing in
  const handleProceedWithoutSignIn = () => {
    // Save the user's preference
    localStorage.setItem('dismissed_signin_prompt', 'true');
    setHasUserDismissedPrompt(true);
    setShowSignInPrompt(false);
    
    // Now proceed with the chat
    if (input.trim()) {
      onStartNewChat(input, { denomination, activeTab });
    }
  };

  // Handle denomination change
  const handleDenominationChange = (value: string) => {
    setDenomination(value);
    
    // Also save to user preferences if they're logged in
    if (isAuthenticated) {
      try {
        fetch('/api/users/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ denomination: value })
        });
      } catch (error) {
        console.error('Error saving denomination preference:', error);
      }
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'sermon' | 'exegesis' | 'counseling') => {
    setActiveTab(tab);
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
      const isDeleted = await deleteContextChat(chatToDelete);
      
      if (isDeleted) {
        // The chat list is automatically updated via the context
        setIsDeleteDialogOpen(false);
        setChatToDelete(null);
      }
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

          {/* Suggestions with loading state */}
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
              _isFixed={false}
              showDisclaimer={true}
              showOptionsBar={true}
              denomination={denomination}
              activeTab={activeTab}
              onDenominationChange={handleDenominationChange}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Recent sermons - Only shown if there are sermons and user is authenticated */}
          {isAuthenticated && chats.length > 0 && (
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