'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BookOpenIcon, ClipboardIcon } from 'lucide-react';
import { toast } from 'sonner';

interface BibleReferenceProps {
  reference: string;
  context?: string;
  onSelect?: (reference: string) => void;
}

export default function BibleReference({ reference, context, onSelect }: BibleReferenceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fullText, setFullText] = useState<string | null>(null);
  
  const handleFetchVerse = async () => {
    if (fullText) {
      setFullText(null);
      return;
    }
    
    setIsLoading(true);
    try {
      // Fetch verse from Bible API
      const res = await fetch(`/api/bible?reference=${encodeURIComponent(reference)}`);
      
      if (!res.ok) {
        throw new Error('Failed to fetch verse');
      }
      
      const data = await res.json();
      setFullText(data.text);
    } catch (error) {
      console.error('Error fetching verse:', error);
      toast.error('Could not load Bible verse');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(fullText || reference);
    toast.success('Copied to clipboard');
  };
  
  return (
    <div className="bg-muted/30 rounded-md p-2 flex flex-col">
      <div className="flex items-center justify-between">
        <span className="font-medium text-sm">{reference}</span>
        <div className="flex space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0" 
                  onClick={handleCopy}
                >
                  <ClipboardIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy reference</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleFetchVerse}
                  disabled={isLoading}
                >
                  <BookOpenIcon className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View verse</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {onSelect && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs" 
              onClick={() => onSelect(reference)}
            >
              Use
            </Button>
          )}
        </div>
      </div>
      
      {context && !fullText && (
        <p className="text-xs text-muted-foreground mt-1">{context}</p>
      )}
      
      {fullText && (
        <div className="text-sm mt-2 bg-background p-2 rounded">
          <p>{fullText}</p>
          <p className="text-xs text-muted-foreground mt-1">Source: ESV Bible</p>
        </div>
      )}
    </div>
  );
}