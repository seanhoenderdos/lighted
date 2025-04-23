'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import MODEL from '@/constants/models';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
  createChat, 
  updateChatMessages, 
  getChatById, 
  generateChatTitle, 
  ChatMessage,
  isAuthenticated
} from '@/lib/chat-storage';
import ChatInput from '@/components/chat/ChatInput';
import ChatBubble from '@/components/chat/ChatBubble';
import LoadingIndicator from '@/components/chat/LoadingIndicator';
import { Button } from '@/components/ui/button';
import ROUTES from '@/constants/routes';

// Fallback suggestions in case API call fails or when starting a new conversation
const FALLBACK_SUGGESTIONS = [
  "Help me craft a sermon on forgiveness based on Matthew 18",
  "I need a 3-point outline on God's grace for Sunday",
  "Suggest Bible passages about overcoming fear for a youth sermon",
  "Create an illustration about faith that connects with modern audiences"
];

const SermonForm = ({ initialMessage, onNewChat, chatId, onBackToChats }: {
  initialMessage?: string;
  onNewChat?: () => void; 
  chatId?: string;
  onBackToChats?: () => void;
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Greetings in Christ. How can I assist with your sermon preparation today?' }
  ]);
  const [input, setInput] = useState(initialMessage || '');
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'temp'>('saved');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [latestAssistantMessageIndex, setLatestAssistantMessageIndex] = useState<number>(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  
  // Check if user has dismissed the sign-in prompt
  const [hasUserDismissedPrompt, setHasUserDismissedPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dismissed_signin_prompt') === 'true';
    }
    return false;
  });

  // Function to fetch AI-generated suggestions based on conversation context
  const fetchSuggestions = useCallback(async (lastResponse?: string) => {
    // Skip fetching if we're just starting (use initial suggestions)
    if (!lastResponse || lastResponse.length < 50) {
      return [];
    }
    
    try {
      setIsFetchingSuggestions(true);
      
      // Extract key topics from the last AI response to provide as context
      const topics = lastResponse.slice(0, 300); // Use first 300 characters as context
      
      // Call our API endpoint with conversation context
      const response = await fetch(`/api/suggestions?count=3&context=${encodeURIComponent(topics)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      
      const data = await response.json();
      
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        return data.suggestions;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return [];
    } finally {
      setIsFetchingSuggestions(false);
    }
  }, []);

  // Memoize handleSend to avoid dependency issues
  const handleSend = useCallback(async (e?: React.FormEvent | null, overrideMessage?: string) => {
    if (e) e.preventDefault();
    
    const messageText = overrideMessage || input;
    if ((!messageText.trim() && !overrideMessage) || loading) return;

    // Clear suggestions when sending a new message
    setSuggestions([]);
    
    const newMessages = [...messages, { role: 'user' as const, content: messageText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          model: MODEL.CURRENT
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const assistantReply = data?.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
      
      // Update messages with the AI response
      const updatedMessages = [...newMessages, { role: 'assistant' as const, content: assistantReply }];
      setMessages(updatedMessages);
      
      // Set the latest assistant message index to allow attaching suggestions to it
      const newAssistantIndex = updatedMessages.length - 1;
      setLatestAssistantMessageIndex(newAssistantIndex);
      
      // Generate suggestions based on the AI response
      const newSuggestions = await fetchSuggestions(assistantReply);
      setSuggestions(newSuggestions);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, { role: 'assistant' as const, content: 'Sorry, there was an error connecting to the server. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, fetchSuggestions]);
  
  // Check authentication status
  const checkAuth = useCallback(async () => {
    return await isAuthenticated();
  }, []);

  // Effect to submit initial message if provided
  useEffect(() => {
    if (initialMessage && messages.length === 1) {
      handleSend(null, initialMessage);
    }
  }, [initialMessage, messages.length, handleSend]);

  // Effect to load chat history if chatId is provided
  useEffect(() => {
    if (chatId) {
      const existingChat = getChatById(chatId);
      if (existingChat) {
        setMessages(existingChat.messages);
        setCurrentChatId(chatId);
        
        // Find the last assistant message
        const lastAssistantIndex = existingChat.messages
          .map((msg, index) => ({ msg, index }))
          .filter(item => item.msg.role === 'assistant')
          .pop()?.index;
        
        if (lastAssistantIndex !== undefined) {
          setLatestAssistantMessageIndex(lastAssistantIndex);
          
          // Generate suggestions based on the last AI response if available
          const lastAIMessage = existingChat.messages[lastAssistantIndex];
          
          if (lastAIMessage) {
            fetchSuggestions(lastAIMessage.content).then(newSuggestions => {
              if (newSuggestions.length > 0) {
                setSuggestions(newSuggestions);
              }
            });
          }
        }
      }
    } else {
      // If it's a new chat, fetch initial suggestions
      fetch('/api/suggestions?count=4')
        .then(response => response.json())
        .then(data => {
          if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
            setSuggestions(data.suggestions);
          } else {
            setSuggestions(FALLBACK_SUGGESTIONS);
          }
        })
        .catch(error => {
          console.error('Error fetching initial suggestions:', error);
          setSuggestions(FALLBACK_SUGGESTIONS);
        });
    }
  }, [chatId, fetchSuggestions]);

  // Effect to save messages whenever they change
  useEffect(() => {
    // Only save if we have at least one user interaction
    if (messages.length > 1) {
      const saveSermon = async () => {
        const isUserAuthenticated = await checkAuth();
        
        if (!isUserAuthenticated) {
          // User is not authenticated, mark as temp/unsaved
          setSaveStatus('temp');
          return;
        }
        
        try {
          // User is authenticated, proceed with saving
          if (!currentChatId) {
            // Create a new chat
            const title = generateChatTitle(messages);
            const newChat = await createChat(messages, title);
            
            if (newChat) {
              setCurrentChatId(newChat.id);
              setSaveStatus('saved');
            } else {
              setSaveStatus('unsaved');
            }
          } else {
            // Update existing chat
            const updated = await updateChatMessages(currentChatId, messages);
            setSaveStatus(updated ? 'saved' : 'unsaved');
          }
        } catch (error) {
          console.error('Error saving sermon:', error);
          setSaveStatus('unsaved');
        }
      };
      
      saveSermon();
    }
  }, [messages, currentChatId, checkAuth]);

  // Effect to add keyboard shortcut for going back (Esc key)
  useEffect(() => {
    if (!onBackToChats) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBackToChats();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBackToChats]);

  // Check for dismissed prompt status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('dismissed_signin_prompt') === 'true';
      setHasUserDismissedPrompt(dismissed);
    }
  }, []);

  // Scroll to bottom effect
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handler for selecting auto-generated suggestions
  const handleSelectSuggestion = (suggestion: string) => {
    // Automatically send the selected suggestion
    handleSend(null, suggestion);
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-background dark:bg-background text-foreground dark:text-foreground transition-colors duration-300">
      {/* Navigation buttons - positioned relative to the content area, not the entire screen */}
      <div className="fixed sm:top-24 top-24 left-4 sm:left-16 right-4 sm:right-7 flex justify-end items-center px-2 sm:px-4 z-10 py-4">
        {/* Back button removed */}
        
        <button
          onClick={onNewChat}
          className="z-50 flex-shrink-0 w-10 h-10 rounded-full primary-gradient text-white flex items-center justify-center border border-transparent hover:opacity-90 transition-opacity shadow-sm"
          aria-label="New sermon"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      {/* Auth warning banner - positioned relative to content area */}
      {!session?.user && saveStatus === 'temp' && messages.length > 1 && !hasUserDismissedPrompt && (
        <div className="absolute top-20 left-0 right-0 z-20 px-4 py-2">
          <div className="max-w-3xl mx-auto bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-amber-400/30 rounded-full flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-700 dark:text-amber-300">
                  <path d="M12 9V13M12 17H12.01M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Sign in to save your sermon and access it later
              </p>
            </div>
            <Link href={ROUTES.SIGN_IN}>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      )}
      
      {/* Main chat container - taking full height and with padding from top for the absolute elements */}
      <main className="flex-1 flex flex-col w-full overflow-hidden pt-20">
        {/* Chat messages area with improved scrolling */}
        <div 
          ref={chatRef}
          className="flex-1 w-full overflow-y-auto px-2 sm:px-4 md:px-6"
        >
          <div className="max-w-3xl w-full mx-auto space-y-6 pb-24">
            {messages.map((message, idx) => (
              <ChatBubble 
                key={idx} 
                message={message} 
                suggestions={idx === latestAssistantMessageIndex ? suggestions : []}
                onSelectSuggestion={handleSelectSuggestion}
                showSuggestions={idx === latestAssistantMessageIndex && suggestions.length > 0}
              />
            ))}
            
            {/* Loading indicator */}
            {loading && <LoadingIndicator />}
          </div>
        </div>
      </main>
      
      {/* Suggestion chips positioned relative to content area - Only show initial suggestions
          when no conversation has started and no initial message was provided */}
      {messages.length <= 1 && !initialMessage && suggestions.length > 0 && (
        <div className="absolute bottom-24 left-0 right-0 px-2 sm:px-4 md:px-6 z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="primary-gradient text-white text-sm rounded-full px-4 py-2 hover:opacity-90 transition-opacity shadow-sm max-w-full whitespace-normal break-words"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <ChatInput 
        input={input}
        setInput={setInput}
        onSubmit={handleSend}
        placeholder="Ask for sermon ideas, Bible passages, or illustrations..."
        isLoading={loading || isFetchingSuggestions}
        autoFocus={!initialMessage && messages.length <= 1}
        isFixed={true}
        suggestions={[]}
        maxSuggestions={0}
        showDisclaimer={true}
      />
    </div>
  );
};

export default SermonForm;