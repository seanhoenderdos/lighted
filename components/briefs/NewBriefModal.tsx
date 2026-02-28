'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageCircle, Mic, ArrowRight } from 'lucide-react';

interface NewBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewBriefModal = ({ isOpen, onClose }: NewBriefModalProps) => {
  const handleOpenTelegram = () => {
    // Replace with your actual Telegram bot link
    window.open('https://t.me/lighted_sermon_bot', '_blank');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-center">
            Start a New Brief
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Record your thoughts via voice note on Telegram
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          {/* Visual indicator */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <Mic className="h-10 w-10 text-primary" />
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                1
              </span>
              <p>Open Telegram and find the Lighted Bot</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                2
              </span>
              <p>Record a 2-5 minute voice note sharing your passage and initial thoughts</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
                3
              </span>
              <p>Receive your exegesis brief in seconds, ready to review here</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleOpenTelegram}
            className="w-full flex items-center justify-center gap-2"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            Open Telegram
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewBriefModal;
