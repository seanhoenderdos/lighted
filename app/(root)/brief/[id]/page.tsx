'use client'

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Check, Calendar, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  readTime: number | null;
  createdAt: string;
  updatedAt: string;
}

export default function BriefWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [brief, setBrief] = useState<BriefData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleCopyAll = async () => {
    if (!brief) return;
    
    const greekSection = brief.greekInsights 
      ? brief.greekInsights.map(g => `### ${g.term} - ${g.meaning}\n${g.context}`).join('\n\n')
      : 'No Greek insights available.';
    
    const outlineSection = brief.outlinePoints
      ? brief.outlinePoints.map((p, i) => `${i + 1}. **${p.title}**\n${p.content}`).join('\n\n')
      : 'No outline available.';

    const content = `
# ${brief.title}

## Original Transcript
${brief.originalTranscript || 'No transcript available.'}

## Greek Word Studies
${greekSection}

## Historical Context
${brief.historicalContext || 'No historical context available.'}

## Sermon Outline
${outlineSection}
    `.trim();

    await navigator.clipboard.writeText(content);
    setCopiedSection('all');
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopySection = async (section: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'old-testament': 'Old Testament',
      'new-testament': 'New Testament',
      'topical': 'Topical'
    };
    return labels[category] || category;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8"></div>
            <div className="h-10 bg-muted rounded w-3/4 mb-4"></div>
            <div className="flex gap-4 mb-8">
              <div className="h-5 bg-muted rounded w-32"></div>
              <div className="h-5 bg-muted rounded w-24"></div>
            </div>
            <div className="h-12 bg-muted rounded mb-6"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !brief) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error || 'Brief not found'}</p>
            <Button onClick={() => router.push('/')}>
              Return to Library
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const greekInsights = brief.greekInsights || [];
  const outlinePoints = brief.outlinePoints || [];

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Library
          </Button>
          
          <Button
            onClick={handleCopyAll}
            className="flex items-center gap-2"
          >
            {copiedSection === 'all' ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy All
              </>
            )}
          </Button>
        </div>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
            {brief.title}
          </h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(brief.createdAt)}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {brief.readTime || 5} min read
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {getCategoryLabel(brief.category)}
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="transcript" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
            <TabsTrigger value="greek">Greek Insights</TabsTrigger>
            <TabsTrigger value="historical">Historical Context</TabsTrigger>
            <TabsTrigger value="outline">Outline</TabsTrigger>
          </TabsList>

          {/* Original Transcript */}
          <TabsContent value="transcript">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Original Transcript</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopySection('transcript', brief.originalTranscript || '')}
                  disabled={!brief.originalTranscript}
                >
                  {copiedSection === 'transcript' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {brief.originalTranscript ? (
                  brief.originalTranscript.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-4 last:mb-0">{para}</p>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">No transcript available.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Greek Insights */}
          <TabsContent value="greek">
            <div className="space-y-4">
              {greekInsights.length > 0 ? (
                greekInsights.map((insight, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-serif text-primary mb-1">
                          {insight.term}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground mb-3">
                          {insight.meaning}
                        </p>
                        <p className="text-sm">{insight.context}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopySection(`greek-${i}`, `${insight.term} (${insight.meaning}): ${insight.context}`)}
                      >
                        {copiedSection === `greek-${i}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6">
                  <p className="text-muted-foreground italic">No Greek insights available.</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Historical Context */}
          <TabsContent value="historical">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Historical &amp; Cultural Context</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopySection('historical', brief.historicalContext || '')}
                  disabled={!brief.historicalContext}
                >
                  {copiedSection === 'historical' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {brief.historicalContext ? (
                  brief.historicalContext.split('\n\n').map((section, i) => {
                    const lines = section.split('\n');
                    const title = lines[0].replace(/\*\*/g, '');
                    const content = lines.slice(1).join(' ');
                    return (
                      <div key={i} className="mb-6 last:mb-0">
                        <h3 className="text-base font-semibold mb-2">{title}</h3>
                        <p>{content}</p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground italic">No historical context available.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Sermon Outline */}
          <TabsContent value="outline">
            <div className="space-y-4">
              {outlinePoints.length > 0 ? (
                outlinePoints.map((point, i) => (
                  <Card key={i} className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{point.title}</h3>
                        <p className="text-sm text-muted-foreground">{point.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopySection(`outline-${i}`, `${point.title}\n${point.content}`)}
                      >
                        {copiedSection === `outline-${i}` ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-6">
                  <p className="text-muted-foreground italic">No sermon outline available.</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
