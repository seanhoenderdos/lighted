'use client'

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Theme from "./Theme";
import MobileNavigation from "./MobileNavigation";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  // New state to track if we're in a chat view
  const [isInChatView, setIsInChatView] = useState(false);
  
  useEffect(() => {
    // Listen for a custom event that SermonForm can emit when it mounts
    const handleChatViewMount = () => {
      setIsInChatView(true);
    };
    
    const handleChatViewUnmount = () => {
      setIsInChatView(false);
    };
    
    // Add event listeners
    window.addEventListener('chatViewMounted', handleChatViewMount);
    window.addEventListener('chatViewUnmounted', handleChatViewUnmount);
    
    // Check on initial load (fallback to pathname check)
    const initialIsInChat = pathname === '/' && document.querySelector('[data-sermon-form]') !== null;
    setIsInChatView(initialIsInChat);
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('chatViewMounted', handleChatViewMount);
      window.removeEventListener('chatViewUnmounted', handleChatViewUnmount);
    };
  }, [pathname]);
  
  const handleNewChat = () => {
    router.push('/');
    // Dispatch a custom event to notify the home page to show the chat selection view
    const newChatEvent = new Event('newChatRequested');
    window.dispatchEvent(newChatEvent);
  };
  
  return (
    <nav className="flex justify-between fixed z-50 w-full p-6 dark:shadow-none sm:px-12 border border-border-line gap-5 backdrop-blur-xl">
      <Link href="/" className="flex items-center gap-1">
        <Image
          src="/images/site-logo.svg"
          width={125}
          height={125}
          alt="lighted Logo"
        />
      </Link>

      <div className="flex items-center gap-4">
        {isInChatView && (
          <Button 
            onClick={handleNewChat}
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1.5"
            aria-label="New chat"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:block">New Chat</span>
          </Button>
        )}
        <Theme />
        <MobileNavigation />
      </div>
    </nav>
  );
};

export default Navbar;
