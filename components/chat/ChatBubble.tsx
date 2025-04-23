'use client'

import React from 'react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import { ChatMessage } from '@/lib/chat-storage';
import ChatSuggestions from './ChatSuggestions';

interface ChatBubbleProps {
  message: ChatMessage;
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  showSuggestions?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ 
  message, 
  suggestions = [], 
  onSelectSuggestion,
  showSuggestions = false
}) => {
  // Helper function to check if text is likely a sermon or Bible discussion
  const isLikelySermon = (text: string): boolean => {
    // Check for sermon indicators - titles, scripture references, sections
    const sermonIndicators = [
      /\*\*Title:/i,
      /\*\*Scripture:/i,
      /\*\*Introduction:/i,
      /\*\*Point \d+:/i,
      /\*\*Building Bridges\*\*/i,
      /\*\*Fanning the Flames\*\*/i,
      /\*\*Conclusion:/i,
      /Hebrews \d+:\d+/i,
      /Galatians \d+:\d+/i,
      /Corinthians \d+:\d+/i,
      /sermon outline/i,
      /in this sermon/i
    ];
    
    return sermonIndicators.some(pattern => pattern.test(text));
  };
  
  // Helper function to check if text contains Bible passages
  const containsBiblePassages = (text: string): boolean => {
    const bibleIndicators = [
      /John \d+:\d+/i,
      /Romans \d+:\d+/i,
      /Genesis \d+:\d+/i,
      /Exodus \d+:\d+/i,
      /Leviticus \d+:\d+/i,
      /Matthew \d+:\d+/i,
      /Mark \d+:\d+/i,
      /Luke \d+:\d+/i,
      /Psalms? \d+:\d+/i,
      /Proverbs? \d+:\d+/i,
      /Bible passage/i,
      /Scripture/i,
      /verse/i,
      /gospel/i
    ];
    
    return bibleIndicators.some(pattern => pattern.test(text));
  };

  // Function to format content with proper styling
  const formatContent = (content: string): React.ReactNode => {
    // Special formatting for sermons
    if (isLikelySermon(content)) {
      const sections = content.split(/(\*\*[\w\s]+:?\*\*|\*\*[\w\s]+\*\*)/g).filter(Boolean);
      
      return (
        <div className="sermon-content space-y-3">
          {sections.map((section, idx) => {
            // Check if this is a heading/title section
            if (/^\*\*[\w\s]+:?\*\*$/.test(section) || /^\*\*[\w\s]+\*\*$/.test(section)) {
              const headingText = section.replace(/\*\*/g, '');
              
              // Special formatting for the main title
              if (headingText.toLowerCase().includes('title:')) {
                return (
                  <h2 key={idx} className="text-lg font-bold text-primary dark:text-primary mt-2">
                    {headingText}
                  </h2>
                );
              }
              
              // Scripture reference formatting
              if (headingText.toLowerCase().includes('scripture:')) {
                return (
                  <div key={idx}>
                    <h3 className="text-base font-semibold mt-3">{headingText}</h3>
                    <Separator className="my-2" />
                  </div>
                );
              }
              
              // Regular section headings
              return (
                <div key={idx}>
                  <h3 className="text-base font-semibold mt-3">{headingText}</h3>
                  <Separator className="my-2" />
                </div>
              );
            }
            
            // Process paragraph content
            const formattedSection = section.split('\n').map((line, lineIdx) => {
              // Format numbered points or bullet points
              if (line.match(/^\d+\.\s/)) {
                const match = line.match(/^\d+\./);
                return (
                  <div key={`line-${lineIdx}`} className="ml-4 my-1.5 flex">
                    <span className="font-semibold mr-2">{match ? match[0] : ''}</span>
                    <span>{line.replace(/^\d+\.\s/, '')}</span>
                  </div>
                );
              }
              
              if (line.match(/^[\*\-•]\s/)) {
                return (
                  <div key={`line-${lineIdx}`} className="ml-4 my-1.5 flex">
                    <span className="mr-2">•</span>
                    <span>{line.replace(/^[\*\-•]\s/, '')}</span>
                  </div>
                );
              }
              
              // Scripture references with special styling
              if (line.match(/([A-Za-z]+\s\d+:\d+(-\d+)?)/)) {
                return (
                  <p key={`line-${lineIdx}`} className="my-1.5 italic">
                    {line}
                  </p>
                );
              }
              
              return line ? <p key={`line-${lineIdx}`} className="my-1.5">{line}</p> : <br key={`line-${lineIdx}`} />;
            });
            
            return <div key={idx}>{formattedSection}</div>;
          })}
        </div>
      );
    }
    
    // Special formatting for content with Bible passages
    else if (containsBiblePassages(content)) {
      const paragraphs = content.split('\n\n').filter(Boolean);
      
      return (
        <div className="bible-content space-y-3">
          {paragraphs.map((paragraph, idx) => {
            // Check if paragraph contains a Bible reference
            if (paragraph.match(/([A-Za-z]+\s\d+:\d+(-\d+)?)/i)) {
              // Highlight Bible references
              const parts = paragraph.split(/(\b[A-Za-z]+\s\d+:\d+(?:-\d+)?)/i);
              return (
                <div key={`para-${idx}`} className="my-3">
                  {parts.map((part, partIdx) => {
                    if (part.match(/\b[A-Za-z]+\s\d+:\d+(?:-\d+)?/i)) {
                      return <span key={`part-${partIdx}`} className="font-semibold text-primary">{part}</span>;
                    }
                    return <span key={`part-${partIdx}`}>{part}</span>;
                  })}
                </div>
              );
            }
            
            return <p key={`para-${idx}`} className="my-2">{paragraph}</p>;
          })}
        </div>
      );
    }
    
    // Format regular content for better readability
    else {
      const paragraphs = content.split('\n\n').filter(Boolean);
      
      return (
        <div className="regular-content space-y-2">
          {paragraphs.map((paragraph, idx) => {
            // Check for lists (numbered or bullet points)
            if (paragraph.includes('\n')) {
              const lines = paragraph.split('\n');
              
              // Check if this might be a list
              const isList = lines.some(line => 
                line.match(/^\d+\.\s/) || line.match(/^[\*\-•]\s/)
              );
              
              if (isList) {
                return (
                  <div key={`list-${idx}`} className="my-3">
                    {lines.map((line, lineIdx) => {
                      // Numbered list items
                      if (line.match(/^\d+\.\s/)) {
                        const match = line.match(/^\d+\./);
                        return (
                          <div key={`line-${lineIdx}`} className="ml-4 my-1.5 flex">
                            <span className="font-semibold mr-2">{match ? match[0] : ''}</span>
                            <span>{line.replace(/^\d+\.\s/, '')}</span>
                          </div>
                        );
                      }
                      
                      // Bullet points
                      if (line.match(/^[\*\-•]\s/)) {
                        return (
                          <div key={`line-${lineIdx}`} className="ml-4 my-1.5 flex">
                            <span className="mr-2">•</span>
                            <span>{line.replace(/^[\*\-•]\s/, '')}</span>
                          </div>
                        );
                      }
                      
                      return <p key={`line-${lineIdx}`} className="my-1">{line}</p>;
                    })}
                  </div>
                );
              }
            }
            
            // Check for emphasis markers like bold or italic
            if (paragraph.includes('**') || paragraph.includes('*') || 
                paragraph.includes('__') || paragraph.includes('_')) {
              const formattedText = paragraph
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/__(.*?)__/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/_(.*?)_/g, '<em>$1</em>');
              
              return (
                <p 
                  key={`para-${idx}`} 
                  className="my-3"
                  dangerouslySetInnerHTML={{ __html: formattedText }}
                />
              );
            }
            
            return <p key={`para-${idx}`} className="my-3 leading-relaxed">{paragraph}</p>;
          })}
        </div>
      );
    }
  };

  // Function to handle copying content to clipboard
  const copyContentToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success('Content copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="w-full">
      <div
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}
      >
        {message.role === 'assistant' && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-2">
            <Image 
              src="/images/logo-dark.svg" 
              alt="Lighted" 
              width={16} 
              height={16} 
              className="hidden dark:block" 
            />
            <Image 
              src="/images/logo-light.svg" 
              alt="Lighted" 
              width={16} 
              height={16} 
              className="block dark:hidden" 
            />
          </div>
        )}
        <div
          className={`
            max-w-[85%] rounded-2xl px-4 py-3 text-base relative
            ${message.role === 'user'
              ? 'primary-gradient text-white shadow-lg'
              : 'bg-white dark:bg-gray-800/40 text-gray-800 dark:text-gray-100 border border-gray-100/30 dark:border-gray-700/30 shadow-md backdrop-blur-sm'}
          `}
        >
          {message.role === 'assistant' ? (
            <>
              {formatContent(message.content)}
              <div className="mt-4 flex justify-end">
                <button 
                  onClick={() => copyContentToClipboard(message.content)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-white primary-gradient hover:opacity-90 transition-opacity text-xs font-medium"
                  aria-label="Copy content to clipboard"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                  </svg>
                  {isLikelySermon(message.content) ? "Copy Sermon" : "Copy Text"}
                </button>
              </div>
            </>
          ) : (
            <span>{message.content}</span>
          )}
        </div>
        {message.role === 'user' && (
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}
      </div>

      {/* Render suggestions below AI messages when they exist and message is from assistant */}
      {message.role === 'assistant' && showSuggestions && suggestions.length > 0 && (
        <div className="ml-10 mt-3">
          <ChatSuggestions
            suggestions={suggestions}
            onSelectSuggestion={onSelectSuggestion || (() => {})}
            maxSuggestions={4}
            variant="chat"
          />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;