'use client'

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import ChatSuggestions from './ChatSuggestions';
import { ChevronDown } from 'lucide-react';

// Denomination options for pastor context
const DENOMINATIONS = [
  'non-denominational',
  'baptist',
  'lutheran',
  'methodist',
  'presbyterian',
  'anglican',
  'pentecostal',
  'catholic',
  'orthodox'
];

// Service types
const SERVICE_TYPES = [
  { value: 'sermon', label: 'Sermon help' },
  { value: 'exegesis', label: 'Bible Exegesis' },
  { value: 'counseling', label: 'Pastoral Counseling' }
];

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
  _isFixed?: boolean; // Changed from isFixed to _isFixed to match parameter name
  suggestions?: string[];
  onSelectSuggestion?: (suggestion: string) => void;
  maxSuggestions?: number;
  variant?: 'default' | 'chat' | 'home';
  showDisclaimer?: boolean;
  showOptionsBar?: boolean;
  denomination?: string;
  onDenominationChange?: (value: string) => void;
  activeTab?: 'sermon' | 'exegesis' | 'counseling';
  onTabChange?: (tab: 'sermon' | 'exegesis' | 'counseling') => void;
}

// Theme styles interface
interface ThemeStyles {
  bg: string;
  border: string;
  inputBg: string;
  text: string;
  placeholder: string;
  dropdownBg: string;
  dropdownHover: string;
}

const ChatInput = ({
  input,
  setInput,
  onSubmit,
  placeholder = "What would you like assistance with?",
  isLoading = false,
  autoFocus = false,
  _isFixed = false, // Added underscore prefix since it's unused
  suggestions = [],
  onSelectSuggestion,
  maxSuggestions = 2,
  variant = 'default',
  showDisclaimer = true,
  showOptionsBar = false,
  denomination = 'non-denominational',
  onDenominationChange,
  activeTab = 'sermon',
  onTabChange,
}: ChatInputProps) => {
  // State to track client-side mounting
  const [mounted, setMounted] = useState(false);
  
  // Get theme using next-themes
  const { theme: currentTheme, resolvedTheme } = useTheme();
  
  // Only determine theme on the client side after mounting
  const isDarkMode = mounted && (currentTheme === 'dark' || resolvedTheme === 'dark');
  
  // Track when component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // State for dropdown visibility
  const [showDenominationDropdown, setShowDenominationDropdown] = useState(false);
  const [showServiceTypeDropdown, setShowServiceTypeDropdown] = useState(false);
  
  // Handler for suggestion selection
  const handleSelectSuggestion = (suggestion: string) => {
    setInput(suggestion);
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion);
    }
  };

  // Handler for denomination change
  const handleDenominationChange = (value: string) => {
    if (onDenominationChange) {
      onDenominationChange(value);
      setShowDenominationDropdown(false);
    } else {
      // Even if no parent handler, still close the dropdown
      setShowDenominationDropdown(false);
    }
  };

  // Handler for tab change
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value as 'sermon' | 'exegesis' | 'counseling');
      setShowServiceTypeDropdown(false);
    } else {
      // Even if no parent handler, still close the dropdown
      setShowServiceTypeDropdown(false);
    }
  };

  // Format denomination for display (capitalize first letter)
  const formatDenomination = (denom: string) => {
    return denom.charAt(0).toUpperCase() + denom.slice(1);
  };

  // Get service type label
  const getServiceTypeLabel = () => {
    const serviceType = SERVICE_TYPES.find(type => type.value === activeTab);
    return serviceType ? serviceType.label : 'Sermon help';
  };

  // Get placeholder based on active tab
  const getPlaceholderByTab = () => {
    switch (activeTab) {
      case 'sermon':
        return "Ask for sermon ideas, Bible passages...";
      case 'exegesis':
        return "Enter a Bible passage for analysis...";
      case 'counseling':
        return "Describe a pastoral counseling situation...";
      default:
        return placeholder;
    }
  };

  // Get theme-based styles
  const getThemeStyles = (): ThemeStyles => {
    // If not mounted yet, return a baseline style that matches server rendering
    // This prevents hydration mismatch between server and client
    if (!mounted) {
      return {
        bg: 'bg-white',
        border: 'border-gray-300',
        inputBg: 'bg-transparent',
        text: 'text-gray-900',
        placeholder: 'placeholder-gray-500',
        dropdownBg: 'bg-white',
        dropdownHover: 'hover:bg-gray-100'
      };
    }
    
    // Once mounted, we can safely use the detected theme
    if (isDarkMode) {
      return {
        bg: 'bg-[#0E1A2B]',
        border: 'border-[#3D4E61]',
        inputBg: 'bg-transparent',
        text: 'text-white',
        placeholder: 'placeholder-gray-400',
        dropdownBg: 'bg-[#1A2B40]',
        dropdownHover: 'hover:bg-[#2A3B50]'
      };
    } else {
      return {
        bg: 'bg-white',
        border: 'border-gray-300',
        inputBg: 'bg-transparent',
        text: 'text-gray-900',
        placeholder: 'placeholder-gray-500',
        dropdownBg: 'bg-white',
        dropdownHover: 'hover:bg-gray-100'
      };
    }
  };

  const themeStyles = getThemeStyles();
  
  return (
    <div className="w-full">
      {/* Display suggestions if available */}
      {suggestions.length > 0 && (
        <ChatSuggestions
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
          maxSuggestions={maxSuggestions}
          variant={variant}
          className="mb-2"
        />
      )}
    
      {/* Chat Input with dropdown options and send button */}
      <div className={`rounded-xl ${themeStyles.bg} border ${themeStyles.border} shadow-lg`}>
        {/* Main input area with dropdowns */}
        <div className="flex flex-col">
          {/* Top row with dropdowns */}
          {showOptionsBar && (
            <div className="flex items-center px-4 pt-3 pb-2">
              {/* Denomination Dropdown */}
              <div className="relative mr-2">
                <button
                  type="button"
                  className={`bg-transparent border ${themeStyles.border} rounded-md py-1 px-3 ${themeStyles.text} flex items-center justify-between`}
                  onClick={() => setShowDenominationDropdown(!showDenominationDropdown)}
                >
                  <span className="mr-1">{formatDenomination(denomination)}</span>
                  <ChevronDown size={16} />
                </button>
                
                {/* Denomination Dropdown Menu */}
                {showDenominationDropdown && (
                  <div className={`absolute z-50 mt-1 ${themeStyles.dropdownBg} border ${themeStyles.border} rounded-md shadow-lg w-48 max-h-48 overflow-y-auto`}>
                    {DENOMINATIONS.map((denom) => (
                      <button
                        key={denom}
                        className={`block w-full text-left px-4 py-2 ${themeStyles.text} ${themeStyles.dropdownHover}`}
                        onClick={() => handleDenominationChange(denom)}
                      >
                        {formatDenomination(denom)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Service Type Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className={`bg-transparent border ${themeStyles.border} rounded-md py-1 px-3 ${themeStyles.text} flex items-center justify-between`}
                  onClick={() => setShowServiceTypeDropdown(!showServiceTypeDropdown)}
                >
                  <span className="mr-1">{getServiceTypeLabel()}</span>
                  <ChevronDown size={16} />
                </button>
                
                {/* Service Type Dropdown Menu */}
                {showServiceTypeDropdown && (
                  <div className={`absolute z-50 mt-1 ${themeStyles.dropdownBg} border ${themeStyles.border} rounded-md shadow-lg w-48`}>
                    {SERVICE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        className={`block w-full text-left px-4 py-2 ${themeStyles.text} ${themeStyles.dropdownHover}`}
                        onClick={() => handleTabChange(type.value)}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Input and send button */}
          <form onSubmit={(e) => { e.preventDefault(); onSubmit(e); }} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholderByTab()}
              className={`w-full p-4 pr-14 ${themeStyles.inputBg} ${themeStyles.text} ${themeStyles.placeholder} focus:outline-none rounded-b-xl`}
              disabled={isLoading}
              autoFocus={autoFocus}
            />
            <button 
              type="submit" 
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-800 disabled:opacity-50"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="text-white"
              >
                <path 
                  d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
      
      {/* Disclaimer message */}
      {showDisclaimer && (
        <div className={`text-center mt-2 ${mounted ? (isDarkMode ? 'text-[#A0AEC0]' : 'text-gray-500') : 'text-gray-500'} text-xs pb-3`}>
          Lighted can make mistakes. Please check important info.
        </div>
      )}
    </div>
  );
};

export default ChatInput;