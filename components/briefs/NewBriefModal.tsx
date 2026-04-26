'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageCircle, FilePlus, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface NewBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewBriefModal = ({ isOpen, onClose }: NewBriefModalProps) => {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenTelegram = () => {
    window.open('https://t.me/lighted_sermon_bot', '_blank');
    onClose();
  };

  const handleCreateBlank = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/briefs/blank', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create brief');
      }

      const data = await response.json();
      router.push(`/brief/${data.briefId}`);
      onClose();
    } catch (error) {
      console.error('Error creating blank brief:', error);
      toast.error('Failed to create workspace. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center">
            Start a New Brief
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Choose how you want to begin your exegesis process
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-4">
          {/* Option 1: Telegram */}
          <div className="p-4 border rounded-xl hover:border-primary/50 transition-colors bg-card">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                <MessageCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <h4 className="font-semibold text-foreground text-base">Record via Telegram</h4>
                <p className="text-muted-foreground pb-3">Send a voice note to our bot and we'll automatically generate your brief.</p>
                <Button
                  onClick={handleOpenTelegram}
                  className="w-full flex items-center justify-center gap-2"
                  variant="outline"
                >
                  Open Telegram
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>

          {/* Option 2: Blank Workspace */}
          <div className="p-4 border border-primary/20 bg-primary/5 rounded-xl hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0 mt-1">
                <FilePlus className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-1 text-sm">
                <h4 className="font-semibold text-foreground text-base">Start Blank Workspace</h4>
                <p className="text-muted-foreground pb-3">Open a new workspace to record audio directly from your device or type from scratch.</p>
                <Button
                  onClick={handleCreateBlank}
                  disabled={isCreating}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                  ) : (
                    <>Create Workspace <ArrowRight className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewBriefModal;
