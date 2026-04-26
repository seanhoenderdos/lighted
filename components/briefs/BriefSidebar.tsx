'use client'

import React, { useState } from 'react';
import { Copy, Check, Calendar, Clock, BookOpen, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GreekInsight {
  term: string;
  transliteration?: string;
  meaning: string;
  context?: string;
  usage?: string;
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
}

interface BriefSidebarProps {
  brief: BriefData;
  isOpen: boolean;
  onClose: () => void;
  onBriefUpdate?: (updatedBrief: any) => void;
}

import { useRouter } from 'next/navigation';
import AudioRecorder from './AudioRecorder';

type SectionId = 'transcript' | 'greek' | 'historical' | 'outline';

export default function BriefSidebar({ brief, isOpen, onClose, onBriefUpdate }: BriefSidebarProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<SectionId | null>('transcript');
  const router = useRouter();

  const handleCopySection = async (section: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const handleCopyAll = async () => {
    const greekSection = brief.greekInsights
      ? brief.greekInsights.map(g => `### ${g.term} ${g.transliteration ? `(${g.transliteration})` : ''} - ${g.meaning}\n${g.usage || g.context || ''}`).join('\n\n')
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

  const toggleSection = (id: SectionId) => {
    setExpandedSection(prev => prev === id ? null : id);
  };

  const greekInsights = brief.greekInsights || [];
  const outlinePoints = brief.outlinePoints || [];
  
  const isBlank = !brief.originalTranscript;

  return (
    <div
      className={`
        brief-sidebar flex flex-col h-full border-l border-border bg-muted/30
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'w-[380px] min-w-[380px]' : 'w-0 min-w-0'}
      `}
    >
      <div className="flex flex-col h-full overflow-hidden" style={{ width: '380px' }}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50">
          <h2 className="text-sm font-semibold text-foreground truncate">
            {isBlank ? 'Workspace Setup' : 'Research Notes'}
          </h2>
          <div className="flex items-center gap-1">
            {!isBlank && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                className="h-7 px-2 text-xs"
              >
                {copiedSection === 'all' ? (
                  <><Check className="h-3 w-3 mr-1" /> Copied</>
                ) : (
                  <><Copy className="h-3 w-3 mr-1" /> Copy All</>
                )}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Brief Metadata */}
        {!isBlank && (
          <div className="px-4 py-3 border-b border-border/50">
            <h3 className="text-base font-serif font-bold text-foreground mb-2 leading-tight">
              {brief.title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(brief.createdAt)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {brief.readTime || 5} min
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                {getCategoryLabel(brief.category)}
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto"
          style={{ scrollbarGutter: 'stable' }}
        >
          {isBlank ? (
            <div className="h-full p-4">
              <AudioRecorder 
                briefId={brief.id} 
                onSuccess={(updated) => {
                  if (onBriefUpdate) onBriefUpdate(updated);
                  router.refresh(); // Still refresh for other components if any
                }} 
              />
            </div>
          ) : (
            <>
          {/* Transcript Section */}
          <AccordionSection
            title="Transcript"
            id="transcript"
            isExpanded={expandedSection === 'transcript'}
            onToggle={() => toggleSection('transcript')}
            onCopy={() => handleCopySection('transcript', brief.originalTranscript || '')}
            isCopied={copiedSection === 'transcript'}
            hasCopy={!!brief.originalTranscript}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              {brief.originalTranscript ? (
                brief.originalTranscript.split('\n\n').map((para, i) => (
                  <p key={i} className="mb-3 last:mb-0 text-muted-foreground leading-relaxed">{para}</p>
                ))
              ) : (
                <p className="text-muted-foreground italic">No transcript available.</p>
              )}
            </div>
          </AccordionSection>

          {/* Greek Insights Section */}
          <AccordionSection
            title="Greek Insights"
            id="greek"
            isExpanded={expandedSection === 'greek'}
            onToggle={() => toggleSection('greek')}
          >
            {greekInsights.length > 0 ? (
              <div className="space-y-3">
                {greekInsights.map((insight, i) => (
                  <Card key={i} className="p-3 bg-background">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-serif text-primary">
                          {insight.term} {insight.transliteration && <span className="text-muted-foreground text-xs font-sans italic">({insight.transliteration})</span>}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-1">{insight.meaning}</p>
                        <p className="text-xs leading-relaxed">{insight.usage || insight.context}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0"
                        onClick={() => handleCopySection(`greek-${i}`, `${insight.term} (${insight.meaning}): ${insight.usage || insight.context}`)}
                      >
                        {copiedSection === `greek-${i}` ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No Greek insights available.</p>
            )}
          </AccordionSection>

          {/* Historical Context Section */}
          <AccordionSection
            title="Historical Context"
            id="historical"
            isExpanded={expandedSection === 'historical'}
            onToggle={() => toggleSection('historical')}
            onCopy={() => handleCopySection('historical', brief.historicalContext || '')}
            isCopied={copiedSection === 'historical'}
            hasCopy={!!brief.historicalContext}
          >
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
              {brief.historicalContext ? (
                brief.historicalContext.split('\n\n').map((section, i) => {
                  const lines = section.split('\n');
                  const title = lines[0].replace(/\*\*/g, '');
                  const content = lines.slice(1).join(' ');
                  return (
                    <div key={i} className="mb-3 last:mb-0">
                      <h4 className="text-xs font-semibold mb-1">{title}</h4>
                      <p className="text-muted-foreground leading-relaxed">{content}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground italic">No historical context available.</p>
              )}
            </div>
          </AccordionSection>

          {/* Outline Section */}
          <AccordionSection
            title="Sermon Outline"
            id="outline"
            isExpanded={expandedSection === 'outline'}
            onToggle={() => toggleSection('outline')}
          >
            {outlinePoints.length > 0 ? (
              <div className="space-y-3">
                {outlinePoints.map((point, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-semibold mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold mb-0.5">{point.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">{point.content}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => handleCopySection(`outline-${i}`, `${point.title}\n${point.content}`)}
                    >
                      {copiedSection === `outline-${i}` ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No sermon outline available.</p>
            )}
          </AccordionSection>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Accordion Sub-component
interface AccordionSectionProps {
  title: string;
  id: string;
  isExpanded: boolean;
  onToggle: () => void;
  onCopy?: () => void;
  isCopied?: boolean;
  hasCopy?: boolean;
  children: React.ReactNode;
}

function AccordionSection({
  title,
  isExpanded,
  onToggle,
  onCopy,
  isCopied,
  hasCopy = true,
  children,
}: AccordionSectionProps) {
  return (
    <div className="border-b border-border/30">
      <div className="flex items-center justify-between hover:bg-muted/50 transition-colors">
        <button
          onClick={onToggle}
          className="flex-1 flex items-center gap-2 px-4 py-3 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">{title}</span>
        </button>
        {onCopy && hasCopy && isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs mr-2"
            onClick={onCopy}
          >
            {isCopied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}
