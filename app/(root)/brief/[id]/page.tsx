'use client'

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BriefSidebar from '@/components/briefs/BriefSidebar';
import SermonEditor from '@/components/briefs/SermonEditor';
import { type JSONContent } from '@tiptap/react';

// Types for brief data
interface GreekInsight {
  term: string;
  meaning: string;
  context: string;
}

interface OutlinePoint {
  title: string;
  content: string;
}

interface BriefData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  originalTranscript: string | null;
  greekInsights: GreekInsight[] | null;
  historicalContext: string | null;
  outlinePoints: OutlinePoint[] | null;
  sermonContent: JSONContent | null;
  readTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function BriefWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Fetch brief data
  useEffect(() => {
    const fetchBrief = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/briefs/${resolvedParams.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Brief not found');
          } else {
            setError('Failed to load brief');
          }
          return;
        }

        const data = await response.json();
        setBrief(data.brief);
      } catch (err) {
        console.error('Error fetching brief:', err);
        setError('Failed to load brief');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrief();
  }, [resolvedParams.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-background">
        {/* Header skeleton */}
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
          <div className="h-8 w-8 bg-muted rounded animate-pulse" />
          <div className="h-5 bg-muted rounded w-48 animate-pulse" />
        </div>
        <div className="flex-1 flex">
          {/* Editor skeleton */}
          <div className="flex-1 p-8">
            <div className="max-w-3xl mx-auto space-y-4">
              <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
          {/* Sidebar skeleton */}
          <div className="w-[380px] border-l border-border p-4 space-y-4">
            <div className="h-5 bg-muted rounded w-32 animate-pulse" />
            <div className="h-4 bg-muted rounded w-full animate-pulse" />
            <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
            <div className="h-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !brief) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">{error || 'Brief not found'}</p>
          <Button onClick={() => router.push('/')}>
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-5rem)] flex flex-col bg-background overflow-hidden">
      {/* Workspace Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background/95 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="h-8 px-2 shrink-0"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Library</span>
          </Button>

          <div className="h-5 w-px bg-border" />

          <h1 className="text-sm font-medium text-foreground truncate">
            {brief.title}
          </h1>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="h-8 px-2 shrink-0"
          title={isSidebarOpen ? 'Hide research panel' : 'Show research panel'}
        >
          {isSidebarOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
          <span className="hidden sm:inline ml-1.5 text-xs">
            {isSidebarOpen ? 'Hide' : 'Research'}
          </span>
        </Button>
      </div>

      {/* Workspace Body */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* Editor */}
        <SermonEditor
          briefId={brief.id}
          initialContent={brief.sermonContent}
          hasTranscript={!!brief.originalTranscript}
        />

        {/* Research Sidebar */}
        <BriefSidebar
          brief={brief}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onBriefUpdate={(updatedBrief) => setBrief(updatedBrief)}
        />
      </div>
    </div>
  );
}
