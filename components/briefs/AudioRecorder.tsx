'use client'

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AudioRecorderProps {
  briefId: string;
  onSuccess: (updatedBrief: any) => void;
}

export default function AudioRecorder({ briefId, onSuccess }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize speech recognition if supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setLiveTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        // If it stops but we are still recording (e.g. stopped due to silence), try to restart
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onend = null; // Prevent restart loop
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      setLiveTranscript('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
        
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {}
      }
      
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone error:', err);
      setError('Could not access microphone. Please check your permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const processAudio = async (blob: Blob) => {
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');

      const response = await fetch(`/api/briefs/${briefId}/audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process audio');
      }

      const data = await response.json();
      toast.success('Audio processed successfully!');
      onSuccess(data.brief);
    } catch (err: any) {
      console.error('Process error:', err);
      setError(err.message || 'An error occurred while processing the audio.');
      toast.error('Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full bg-card rounded-xl border border-dashed border-border/60">
      <div className="text-center mb-8 max-w-[250px]">
        <h3 className="font-semibold text-lg mb-2">Record Your Thoughts</h3>
        <p className="text-sm text-muted-foreground">
          Speak your sermon passage and initial ideas. Our AI will transcribe and generate insights for you.
        </p>
      </div>

      <div className="relative flex items-center justify-center w-32 h-32 mb-6">
        {isRecording && (
          <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping" />
        )}
        
        {isProcessing ? (
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : isRecording ? (
          <button 
            onClick={stopRecording}
            className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex flex-col items-center justify-center hover:bg-red-100 transition-colors shadow-sm relative z-10"
          >
            <Square className="w-8 h-8 mb-1 fill-current" />
          </button>
        ) : (
          <button 
            onClick={startRecording}
            className="w-24 h-24 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md relative z-10"
          >
            <Mic className="w-10 h-10" />
          </button>
        )}
      </div>

      <div className="h-8 mb-4">
        {isProcessing ? (
          <p className="text-sm font-medium text-primary animate-pulse">
            Transcribing and analyzing...
          </p>
        ) : isRecording ? (
          <p className="text-xl font-mono font-medium text-red-500">
            {formatTime(duration)}
          </p>
        ) : (
          <p className="text-sm font-medium text-muted-foreground">
            Tap to start recording
          </p>
        )}
      </div>

      {/* Live Transcript Preview */}
      {isRecording && (
        <div className="w-full max-w-md mt-4 p-4 bg-muted/30 rounded-lg border border-border/50 text-sm text-foreground/80 max-h-32 overflow-y-auto">
          {liveTranscript || (
            <span className="text-muted-foreground italic">Listening...</span>
          )}
        </div>
      )}

      {error && (
        <div className="mt-6 p-3 bg-destructive/10 text-destructive text-sm rounded-md flex items-start gap-2 max-w-xs text-left">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
