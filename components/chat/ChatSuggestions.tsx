'use client'

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface ChatSuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (suggestion: string) => void;
  maxSuggestions?: number;
  className?: string;
  variant?: 'chat' | 'home' | 'default'; // New prop to control styling
}

const ChatSuggestions = ({
  suggestions,
  onSelectSuggestion,
  maxSuggestions = 7,
  className = '',
  variant = 'default', // Default styling
}: ChatSuggestionsProps) => {
  // Ensure suggestions are strings only
  const displayedSuggestions = useMemo(() => {
    if (!suggestions) return [];
    return suggestions
      .filter(suggestion => typeof suggestion === 'string')
      .slice(0, maxSuggestions);
  }, [suggestions, maxSuggestions]);
  
  if (!displayedSuggestions.length) return null;

  // Style based on variant
  let containerStyle = '';
  let buttonStyle = '';

  switch (variant) {
    case 'home':
      // Restoring original Home page styling
      containerStyle = "w-full my-6 flex flex-col md:flex-row md:flex-wrap md:justify-center items-center gap-3";
      buttonStyle = "w-full md:w-auto md:flex-shrink-0 text-center bg-navy-900/40 hover:bg-navy-800 text-foreground rounded-full px-4 py-3 flex items-center justify-center transition-colors border border-navy-700/50 shadow-sm";
      break;
      
    case 'chat':
      // Chat UI styling - improved for mobile with text wrapping
      containerStyle = "w-full flex flex-wrap gap-2 mb-4";
      buttonStyle = "flex-shrink-0 text-primary hover:bg-accent rounded-md px-3 py-2 flex items-center justify-center transition-colors text-sm border border-border/50 hover:border-border max-w-full whitespace-normal break-words";
      break;
      
    default:
      // Default styling - optimized for mobile
      containerStyle = "w-full my-6 flex flex-wrap justify-start items-center gap-2";
      buttonStyle = "flex-shrink-0 text-center primary-gradient text-white rounded-full px-4 py-2 flex items-center justify-center transition-opacity hover:opacity-90 shadow-sm max-w-full whitespace-normal break-words";
      break;
  }

  return (
    <div className={cn(containerStyle, className)}>
      {displayedSuggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelectSuggestion(suggestion)}
          className={buttonStyle}
        >
          {variant === 'home' && (
            <div className="flex items-center justify-center">
              <div className="mr-2.5 flex-shrink-0">
                <svg className="w-5 h-5 text-teal-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 8h2a2 2 0 0 1 2 2v2m-1.5 3.5L16 18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h7" />
                  <path d="M14 2l-5 5 5 5" />
                </svg>
              </div>
              <span className="text-sm md:text-base">{suggestion}</span>
            </div>
          )}
          
          {variant !== 'home' && (
            <span className="text-sm">{suggestion}</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ChatSuggestions;