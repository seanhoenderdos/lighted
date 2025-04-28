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
  getAllChats,
  ChatMessage,
  isAuthenticated,
  ChatSession
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

const SermonForm = ({ 
  initialMessage, 
  onNewChat: _onNewChat, 
  chatId, 
  onBackToChats,
  denomination: initialDenomination,
  activeTab: initialActiveTab 
}: {
  initialMessage?: string;
  onNewChat?: () => void; 
  chatId?: string;
  onBackToChats?: () => void;
  denomination?: string;
  activeTab?: 'sermon' | 'exegesis' | 'counseling';
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
  
  // Pastor-focused features
  const [activeTab, setActiveTab] = useState<'sermon' | 'exegesis' | 'counseling'>(initialActiveTab || 'sermon');
  const [denomination, setDenomination] = useState<string>(initialDenomination || 'non-denominational');
  const [bibleReferences, setBibleReferences] = useState<Array<{reference: string; context?: string}>>([]);
  const [_isAnalyzingReferences, setIsAnalyzingReferences] = useState(false);
  
  const chatRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  
  // Check if user has dismissed the sign-in prompt
  const [hasUserDismissedPrompt, setHasUserDismissedPrompt] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dismissed_signin_prompt') === 'true';
    }
    return false;
  });

  // Debounce timeout reference for saving
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Flag to track if messages have been saved
  const [hasSaved, setHasSaved] = useState(!!chatId);

  // Function to detect Bible references in the conversation
  const analyzeBibleReferences = useCallback(async () => {
    if (messages.length < 2) return;
    
    setIsAnalyzingReferences(true);
    
    try {
      // Use the last two messages for context
      const lastMessages = messages.slice(-2).map(m => m.content).join("\n");
      
      const res = await fetch('/api/bible/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: lastMessages })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.references && Array.isArray(data.references)) {
          setBibleReferences(data.references);
        }
      }
    } catch (error) {
      console.error('Error detecting Bible references:', error);
    } finally {
      setIsAnalyzingReferences(false);
    }
  }, [messages]);

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
      
      // Call our API endpoint with conversation context and selected options
      const response = await fetch(
        `/api/suggestions?count=3&context=${encodeURIComponent(topics)}&denomination=${denomination}&activeTab=${activeTab}`
      );
      
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
  }, [denomination, activeTab]); // Add dependencies so suggestions refresh when these change

  // Function to check if a similar chat already exists
  const checkForDuplicateChat = useCallback((messagesContent: ChatMessage[], existingChats: ChatSession[]): boolean => {
    if (messagesContent.length <= 1) return false;
    
    const firstUserMessage = messagesContent.find(m => m.role === 'user')?.content || '';
    if (!firstUserMessage) return false;
    
    // Check if we have a chat that starts with the same user message
    return existingChats.some(chat => {
      const chatFirstUserMessage = chat.messages.find(m => m.role === 'user')?.content || '';
      return chatFirstUserMessage === firstUserMessage && chat.id !== currentChatId;
    });
  }, [currentChatId]);

  // Memoize handleSend to avoid dependency issues
  const handleSend = useCallback(async (e?: React.FormEvent | null, overrideMessage?: string) => {
    if (e) e.preventDefault();
    
    const messageText = overrideMessage || input;
    if ((!messageText.trim() && !overrideMessage) || loading) return;

    // Clear suggestions when sending a new message
    setSuggestions([]);
    
    // Determine if this looks like a pastoral counseling question
    const isCounselingQuestion = messageText.toLowerCase().includes('counsel') || 
      messageText.toLowerCase().includes('advice') || 
      messageText.toLowerCase().includes('struggling') ||
      messageText.toLowerCase().includes('help with');
    
    // Determine if this looks like an exegesis request
    const isExegesisRequest = messageText.toLowerCase().includes('explain') && 
      (messageText.toLowerCase().includes('verse') || 
       messageText.toLowerCase().includes('passage') || 
       /\d+:\d+/.test(messageText));
    
    // Set the appropriate tab based on the message content
    if (isCounselingQuestion) {
      setActiveTab('counseling');
    } else if (isExegesisRequest) {
      setActiveTab('exegesis');
    }
    
    const newMessages = [...messages, { role: 'user' as const, content: messageText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Different API endpoints based on the active tab
      let apiEndpoint = '/api/chat';
      let payload: Record<string, unknown> = {
        messages: newMessages.map(({ role, content }) => ({ role, content })),
        model: MODEL.CURRENT
      };
      
      if (activeTab === 'exegesis') {
        apiEndpoint = '/api/exegesis';
        // Extract likely Bible reference from message
        const bibleReferenceMatch = messageText.match(/(?:explain|passage|verse|exegesis).*?((?:[1-3]?\s*[a-zA-Z]+\s*\d+:\d+(?:-\d+)?)|(?:[a-zA-Z]+\s*\d+:\d+(?:-\d+)?))/i);
        const passage = bibleReferenceMatch ? bibleReferenceMatch[1] : messageText;
        payload = { passage, denomination };
      } else if (activeTab === 'counseling') {
        apiEndpoint = '/api/counseling';
        payload = { situation: messageText, denominationContext: denomination };
      }
      
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      let assistantReply = '';
      
      if (apiEndpoint === '/api/chat') {
        assistantReply = data?.choices?.[0]?.message?.content || 'Sorry, something went wrong.';
      } else if (apiEndpoint === '/api/exegesis') {
        assistantReply = data?.exegesis || 'Sorry, could not generate exegesis.';
      } else if (apiEndpoint === '/api/counseling') {
        assistantReply = data?.guidance || 'Sorry, could not generate counseling guidance.';
      }
      
      // Update messages with the AI response
      const updatedMessages = [...newMessages, { role: 'assistant' as const, content: assistantReply }];
      setMessages(updatedMessages);
      
      // Set the latest assistant message index to allow attaching suggestions to it
      const newAssistantIndex = updatedMessages.length - 1;
      setLatestAssistantMessageIndex(newAssistantIndex);
      
      // Analyze Bible references in the new response
      if (assistantReply.length > 100) {
        analyzeBibleReferences();
      }
      
      // Generate suggestions based on the AI response
      const newSuggestions = await fetchSuggestions(assistantReply);
      setSuggestions(newSuggestions);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages([...newMessages, { role: 'assistant' as const, content: 'Sorry, there was an error connecting to the server. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, fetchSuggestions, activeTab, denomination, analyzeBibleReferences]);
  
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

  // Effect to save messages whenever they change - with debounce
  useEffect(() => {
    // Don't save if there's only the initial assistant greeting
    if (messages.length <= 1) return;
    
    // Clear any pending save timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set up a new timeout for saving (debounced)
    saveTimeoutRef.current = setTimeout(async () => {
      const isUserAuthenticated = await checkAuth();
      
      if (!isUserAuthenticated) {
        // User is not authenticated, mark as temp/unsaved
        setSaveStatus('temp');
        return;
      }
      
      try {
        // Get all existing chats to check for duplicates
        const existingChats = getAllChats();
        
        // User is authenticated, proceed with saving
        if (!currentChatId) {
          // Check for duplicates only when creating a new chat
          const isDuplicate = checkForDuplicateChat(messages, existingChats);
          
          // If this appears to be a duplicate, don't save it
          if (isDuplicate) {
            console.log('Prevented saving duplicate chat');
            setSaveStatus('saved'); // Mark as "saved" to avoid confusion
            return;
          }
          
          // If not a duplicate, create a new chat
          const title = generateChatTitle(messages);
          const newChat = await createChat(messages, title);
          
          if (newChat) {
            setCurrentChatId(newChat.id);
            setSaveStatus('saved');
            setHasSaved(true);
          } else {
            setSaveStatus('unsaved');
          }
        } else if (!hasSaved || messages.length > 2) {
          // Update existing chat
          const updated = await updateChatMessages(currentChatId, messages);
          setSaveStatus(updated ? 'saved' : 'unsaved');
          if (updated) setHasSaved(true);
        }
      } catch (error) {
        console.error('Error saving sermon:', error);
        setSaveStatus('unsaved');
      }
    }, 1000); // 1 second debounce
    
    // Clean up timeout on component unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, currentChatId, checkAuth, checkForDuplicateChat, hasSaved]);

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

  // Emit custom event when SermonForm mounts/unmounts for navbar visibility
  useEffect(() => {
    // Dispatch event to signal chat view is mounted
    const chatViewMounted = new Event('chatViewMounted');
    window.dispatchEvent(chatViewMounted);
    
    // Clean up on unmount
    return () => {
      const chatViewUnmounted = new Event('chatViewUnmounted');
      window.dispatchEvent(chatViewUnmounted);
    };
  }, []);

  // Check for dismissed prompt status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('dismissed_signin_prompt') === 'true';
      setHasUserDismissedPrompt(dismissed);
    }
  }, []);

  // Effect to load user's denomination preference
  useEffect(() => {
    if (!session?.user) return;
    
    const loadUserPreferences = async () => {
      try {
        const response = await fetch('/api/users/preferences');
        if (response.ok) {
          const data = await response.json();
          if (data.denomination) {
            setDenomination(data.denomination);
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, [session]);

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

  // Handler for selecting a Bible reference to insert into input
  const handleSelectBibleReference = (reference: string) => {
    setInput(prev => prev ? `${prev} ${reference}` : reference);
  };

  // Handle denomination change
  const handleDenominationChange = (value: string) => {
    console.info('Changing denomination to:', value);
    setDenomination(value);
    
    // Also save to user preferences if they're logged in
    if (session?.user) {
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
    console.info('Changing tab to:', tab);
    setActiveTab(tab);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" data-sermon-form>
      {/* Auth warning banner - positioned at the top */}
      {!session?.user && saveStatus === 'temp' && messages.length > 1 && !hasUserDismissedPrompt && (
        <div className="sticky top-0 z-20 px-4 py-2 bg-background">
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
      
      {/* Scrollable chat messages container */}
      <div 
        ref={chatRef}
        className="flex-1 overflow-y-auto px-4 md:px-6"
      >
        <div className="max-w-3xl w-full mx-auto space-y-6 py-4">
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
          
          {/* Add some space at the bottom for better scrolling */}
          <div className="h-4"></div>
        </div>
      </div>
      
      {/* Bible References section */}
      {bibleReferences.length > 0 && (
        <div className="flex-shrink-0 max-w-3xl mx-auto w-full px-4 mt-2 mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <h3 className="text-sm font-medium mb-2">Related Bible Passages:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {bibleReferences.map((ref, idx) => (
                <div key={idx} className="text-xs bg-background rounded p-2">
                  <button 
                    onClick={() => handleSelectBibleReference(ref.reference)}
                    className="font-medium hover:text-primary cursor-pointer"
                  >
                    {ref.reference}
                  </button>
                  {ref.context && <span className="text-muted-foreground"> - {ref.context}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Suggestion chips - Only show initial suggestions when no conversation has started */}
      {messages.length <= 1 && !initialMessage && suggestions.length > 0 && (
        <div className="flex-shrink-0 w-full px-4 py-4 z-10">
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
      
      {/* Chat input - fixed at the bottom */}
      <div className="flex-shrink-0 sticky bottom-0 w-full bg-background z-10 border-t border-border/30">
        <div className="max-w-3xl mx-auto">
          <ChatInput 
            input={input}
            setInput={setInput}
            onSubmit={handleSend}
            isLoading={loading || isFetchingSuggestions}
            autoFocus={!initialMessage && messages.length <= 1}
            _isFixed={false}
            showDisclaimer={true}
            showOptionsBar={true}
            denomination={denomination}
            onDenominationChange={handleDenominationChange}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>
    </div>
  );
};

export default SermonForm;