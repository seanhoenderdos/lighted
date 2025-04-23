'use client'

import React from 'react';
import ChatSuggestions from './ChatSuggestions';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
  isFixed?: boolean; // New prop to control positioning
  suggestions?: string[]; // Added suggestions prop
  onSelectSuggestion?: (suggestion: string) => void; // Added handler for suggestion selection
  maxSuggestions?: number; // Optional prop to limit the number of suggestions
  variant?: 'default' | 'primary' | 'outline'; // Added variant prop for styling
  showDisclaimer?: boolean; // New prop to control showing the disclaimer
}

const ChatInput = ({
  input,
  setInput,
  onSubmit,
  placeholder = "What would you like assistance with?",
  isLoading = false,
  autoFocus = false,
  isFixed = false, // Default to not fixed
  suggestions = [], // Default to empty array
  onSelectSuggestion, // Handler for when a suggestion is selected
  maxSuggestions = 2, // Default to 2 suggestions max
  variant = 'outline', // Default to outline variant
  showDisclaimer = true, // Default to showing the disclaimer
}: ChatInputProps) => {
  // Handler for suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    // Set the input to the selected suggestion
    setInput(suggestion);
    
    // If there's a custom handler provided, call it
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
  };
  
  return (
    <div className={`
      p-4 z-20
      ${isFixed 
        ? "md:relative md:bottom-auto md:left-auto md:right-auto fixed bottom-0 left-0 sm:left-60 right-0" 
        : "w-full"}
    `}>
      <div className="max-w-3xl mx-auto w-full">
        {/* Display suggestions if available */}
        {suggestions.length > 0 && (
          <ChatSuggestions
            suggestions={suggestions}
            onSelectSuggestion={handleSelectSuggestion}
            maxSuggestions={maxSuggestions}
            variant={variant} // This passes the variant to ChatSuggestions
            className="mb-2" // Add a little margin below the suggestions
          />
        )}
      
        <form
          className="flex items-center bg-card text-card-foreground rounded-lg pl-5 pr-2 py-2 shadow-md border border-border"
          onSubmit={onSubmit}
        >
          <input
            type="text"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 border-none text-foreground text-base outline-none bg-transparent"
            disabled={isLoading}
            autoComplete="off"
            autoFocus={autoFocus}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="ml-2 flex-shrink-0 w-10 h-10 rounded-full primary-gradient hover:opacity-90 disabled:opacity-50 flex items-center justify-center text-white transition-opacity duration-200"
          >
            {!isLoading ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>
        </form>
        
        {/* Disclaimer message */}
        {showDisclaimer && (
          <div className="text-center text-xs text-muted-foreground mt-2">
            Lighted can make mistakes. Please check important info.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;