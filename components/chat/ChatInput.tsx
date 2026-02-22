'use client'

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import ChatSuggestions from './ChatSuggestions';
import { ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  
  // Get mobile state
  const isMobile = useIsMobile();
  
  // Get theme using next-themes
  const { theme: currentTheme, resolvedTheme } = useTheme();
  
  // Only determine theme on the client side after mounting
  const isDarkMode = mounted && (currentTheme === 'dark' || resolvedTheme === 'dark');
  
  // State for dropdown visibility - moved before useEffect hooks that reference them
  const [showDenominationDropdown, setShowDenominationDropdown] = useState(false);
  const [showServiceTypeDropdown, setShowServiceTypeDropdown] = useState(false);
  
  // References for dropdown containers to detect clicks outside
  const denominationDropdownRef = React.useRef<HTMLDivElement>(null);
  const serviceTypeDropdownRef = React.useRef<HTMLDivElement>(null);
  
  // Track when component is mounted on client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Handle click outside to close dropdowns and reposition dropdowns on scroll/resize
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if not mounted yet
      if (!mounted) return;
      
      // Close denomination dropdown if clicked outside
      if (
        denominationDropdownRef.current && 
        showDenominationDropdown &&
        !denominationDropdownRef.current.contains(event.target as Node)
      ) {
        setShowDenominationDropdown(false);
      }
      
      // Close service type dropdown if clicked outside
      if (
        serviceTypeDropdownRef.current && 
        showServiceTypeDropdown &&
        !serviceTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setShowServiceTypeDropdown(false);
      }
    };
    
    // Handle window resize and scroll for dropdown positioning
    const handleWindowEvents = () => {
      // Force re-render dropdowns if they're open
      if (showDenominationDropdown || showServiceTypeDropdown) {
        // This causes React to re-render with updated positions
        setShowDenominationDropdown(showDenominationDropdown);
        setShowServiceTypeDropdown(showServiceTypeDropdown);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleWindowEvents);
    window.addEventListener('scroll', handleWindowEvents, true);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleWindowEvents);
      window.removeEventListener('scroll', handleWindowEvents, true);
    };
  }, [mounted, showDenominationDropdown, showServiceTypeDropdown]);
  
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
        border: 'border-slate-200',
        inputBg: 'bg-transparent',
        text: 'text-slate-900',
        placeholder: 'placeholder-slate-400',
        dropdownBg: 'bg-white',
        dropdownHover: 'hover:bg-slate-50'
      };
    }
    
    // Once mounted, we can safely use the detected theme
    // Updated to use CSS variables via Tailwind classes for modern look
    return {
      bg: 'bg-card/80 backdrop-blur-md',
      border: 'border-border/50',
      inputBg: 'bg-transparent',
      text: 'text-foreground',
      placeholder: 'placeholder-muted-foreground',
      dropdownBg: 'bg-popover/90 backdrop-blur-sm',
      dropdownHover: 'hover:bg-accent hover:text-accent-foreground'
    };
  };

  // Calculate dropdown position based on mobile state
  const getDropdownPosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { top: 0, left: 0 };
    
    const rect = ref.current.getBoundingClientRect();
    const left = rect.left + window.scrollX;
    
    // On mobile, position dropdown above the trigger button
    if (isMobile) {
      // Position dropdown above the button with a small gap
      // Use transform to position from bottom of dropdown to avoid calculating height
      const top = rect.top + window.scrollY - 8; // 8px gap above the button
      return { 
        top, 
        left,
        transform: 'translateY(-100%)' // This moves the dropdown up by its own height
      };
    }
    
    // On desktop, position dropdown below the trigger button (original behavior)
    const top = rect.bottom + window.scrollY + 4; // 4px gap below
    return { top, left };
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
      <div className={`rounded-xl ${themeStyles.bg} border ${themeStyles.border} shadow-lg shadow-black/5`}>
        {/* Main input area with dropdowns */}
        <div className="flex flex-col">
          {/* Top row with dropdowns */}
          {showOptionsBar && (
            <div className="flex items-center px-4 pt-3 pb-2">              {/* Denomination Dropdown */}
              <div className="relative mr-2" ref={denominationDropdownRef}>
                <button
                  type="button"
                  className={`bg-transparent border ${themeStyles.border} rounded-md py-1.5 px-3 text-sm font-medium ${themeStyles.text} hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between`}
                  onClick={() => setShowDenominationDropdown(!showDenominationDropdown)}
                >
                  <span className="mr-1">{formatDenomination(denomination)}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 text-muted-foreground ${showDenominationDropdown ? 'transform rotate-180' : ''}`} />
                </button>                {/* Denomination Dropdown Menu */}
                {showDenominationDropdown && (
                  <div 
                    className={`fixed z-50 ${themeStyles.dropdownBg} border ${themeStyles.border} rounded-lg shadow-xl w-48 max-h-72 overflow-y-auto p-1`}
                    style={getDropdownPosition(denominationDropdownRef)}
                  >
                    <div className="py-1">
                      {DENOMINATIONS.map((denom) => (
                        <button
                          key={denom}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${themeStyles.text} ${themeStyles.dropdownHover}`}
                          onClick={() => handleDenominationChange(denom)}
                        >
                          {formatDenomination(denom)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>              {/* Service Type Dropdown */}
              <div className="relative" ref={serviceTypeDropdownRef}>
                <button
                  type="button"
                  className={`bg-transparent border ${themeStyles.border} rounded-md py-1.5 px-3 text-sm font-medium ${themeStyles.text} hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-between`}
                  onClick={() => setShowServiceTypeDropdown(!showServiceTypeDropdown)}
                >
                  <span className="mr-1">{getServiceTypeLabel()}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 text-muted-foreground ${showServiceTypeDropdown ? 'transform rotate-180' : ''}`} />
                </button>                {/* Service Type Dropdown Menu */}
                {showServiceTypeDropdown && (
                  <div 
                    className={`fixed z-50 ${themeStyles.dropdownBg} border ${themeStyles.border} rounded-lg shadow-xl w-48 max-h-72 overflow-y-auto p-1`}
                    style={getDropdownPosition(serviceTypeDropdownRef)}
                  >
                    <div className="py-1">
                      {SERVICE_TYPES.map((type) => (
                        <button
                          key={type.value}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${themeStyles.text} ${themeStyles.dropdownHover}`}
                          onClick={() => handleTabChange(type.value)}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
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
              className={`w-full p-4 pr-14 ${themeStyles.inputBg} ${themeStyles.text} ${themeStyles.placeholder} focus:outline-none rounded-b-xl text-base`}
              disabled={isLoading}
              autoFocus={autoFocus}
            />
            <button 
              type="submit" 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className={`text-center mt-3 ${mounted ? (isDarkMode ? 'text-muted-foreground' : 'text-muted-foreground') : 'text-muted-foreground'} text-xs font-medium`}>
          LightEd can make mistakes. Please check important info.
        </div>
      )}
    </div>
  );
};

export default ChatInput;