'use client'

import React from 'react';
import { Card } from '@/components/ui/card';
import { Bookmark, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Brief {
  id: string;
  title: string;
  description: string;
  status: 'in-progress' | 'completed' | 'draft';
  category: 'old-testament' | 'new-testament' | 'topical';
  createdAt: Date;
  updatedAt: Date;
  readTime?: number; // in minutes
  isBookmarked?: boolean;
}

interface BriefCardProps {
  brief: Brief;
  variant?: 'default' | 'featured';
  onClick?: () => void;
  onBookmark?: () => void;
}

const BriefCard = ({ brief, variant = 'default', onClick, onBookmark }: BriefCardProps) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(date);
  };

  const statusLabel = {
    'in-progress': 'IN PROGRESS',
    'completed': 'COMPLETED',
    'draft': 'DRAFT'
  };

  if (variant === 'featured') {
    return (
      <Card
        className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-card"
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 text-xs font-medium bg-muted rounded-full uppercase tracking-wide">
              {statusLabel[brief.status]}
            </span>
            <span className="text-sm text-muted-foreground">
              Last edited {formatTimeAgo(brief.updatedAt)}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(brief.createdAt)}
            </div>
            {brief.readTime && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {brief.readTime} min read
              </div>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">
          {brief.title}
        </h2>

        <blockquote className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground">
          &ldquo;{brief.description}&rdquo;
        </blockquote>
      </Card>
    );
  }

  return (
    <Card
      className="p-5 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-card group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-serif font-semibold text-primary dark:text-primary-foreground line-clamp-2">
          {brief.title}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBookmark?.();
          }}
          className="p-1.5 rounded hover:bg-muted transition-colors opacity-60 hover:opacity-100"
        >
          <Bookmark
            className={cn(
              "h-4 w-4",
              brief.isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
        </button>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3">
        {brief.description}
      </p>
    </Card>
  );
};

export default BriefCard;
