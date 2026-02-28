'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BriefCard, { Brief } from './BriefCard';
import NewBriefModal from './NewBriefModal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/client-auth';

// Filter categories
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'old-testament', label: 'Old Testament' },
  { id: 'new-testament', label: 'New Testament' },
  { id: 'topical', label: 'Topical' },
] as const;

type FilterId = typeof FILTERS[number]['id'];

interface BriefsLibraryProps {
  onSelectBrief?: (briefId: string) => void;
}

const BriefsLibrary = ({ onSelectBrief }: BriefsLibraryProps) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [isNewBriefModalOpen, setIsNewBriefModalOpen] = useState(false);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch briefs from API
  useEffect(() => {
    const fetchBriefs = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch(`/api/briefs?userId=${user.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch briefs');
        }

        const data = await response.json();
        
        // Transform API data to Brief format
        const transformedBriefs: Brief[] = data.briefs.map((brief: {
          id: string;
          title: string;
          description: string | null;
          status: string;
          category: string;
          readTime: number | null;
          isBookmarked: boolean;
          createdAt: string;
          updatedAt: string;
        }) => ({
          id: brief.id,
          title: brief.title,
          description: brief.description || '',
          status: brief.status as 'in-progress' | 'completed' | 'draft',
          category: brief.category as 'old-testament' | 'new-testament' | 'topical',
          readTime: brief.readTime || undefined,
          isBookmarked: brief.isBookmarked,
          createdAt: new Date(brief.createdAt),
          updatedAt: new Date(brief.updatedAt),
        }));

        setBriefs(transformedBriefs);
      } catch (err) {
        console.error('Error fetching briefs:', err);
        setError('Failed to load briefs');
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchBriefs();
    }
  }, [isAuthenticated, user?.id, authLoading]);

  // Get active project (most recent in-progress)
  const activeProject = useMemo(() => {
    return briefs.find(brief => brief.status === 'in-progress');
  }, [briefs]);

  // Filter briefs based on search and category
  const filteredBriefs = useMemo(() => {
    return briefs.filter(brief => {
      // Exclude active project from recent library
      if (brief.id === activeProject?.id) return false;

      // Apply search filter
      const matchesSearch = searchQuery === '' ||
        brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brief.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Apply category filter
      const matchesCategory = activeFilter === 'all' || brief.category === activeFilter;

      return matchesSearch && matchesCategory;
    });
  }, [briefs, searchQuery, activeFilter, activeProject?.id]);

  const handleBookmark = async (briefId: string) => {
    const brief = briefs.find(b => b.id === briefId);
    if (!brief) return;

    // Optimistic update
    setBriefs(prev => prev.map(b =>
      b.id === briefId
        ? { ...b, isBookmarked: !b.isBookmarked }
        : b
    ));

    try {
      const response = await fetch(`/api/briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBookmarked: !brief.isBookmarked })
      });

      if (!response.ok) {
        // Revert on error
        setBriefs(prev => prev.map(b =>
          b.id === briefId
            ? { ...b, isBookmarked: brief.isBookmarked }
            : b
        ));
      }
    } catch {
      // Revert on error
      setBriefs(prev => prev.map(b =>
        b.id === briefId
          ? { ...b, isBookmarked: brief.isBookmarked }
          : b
      ));
    }
  };

  const handleSelectBrief = (briefId: string) => {
    onSelectBrief?.(briefId);
  };

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-2"></div>
            <div className="h-4 bg-muted rounded w-64 mb-8"></div>
            <div className="h-12 bg-muted rounded mb-6"></div>
            <div className="flex gap-2 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 w-24 bg-muted rounded-full"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
                Your Briefs
              </h1>
              <p className="text-muted-foreground">
                Sign in to view your exegesis briefs
              </p>
            </div>
            <Button
              onClick={() => setIsNewBriefModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Brief
            </Button>
          </div>
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground mb-4">
              Sign in to access your sermon research library
            </p>
            <Button asChild variant="outline">
              <a href="/sign-in">Sign In</a>
            </Button>
          </div>
          <NewBriefModal
            isOpen={isNewBriefModalOpen}
            onClose={() => setIsNewBriefModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-full bg-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center py-16">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
              Your Briefs
            </h1>
            <p className="text-muted-foreground">
              Manage your sermons and research notes
            </p>
          </div>
          <Button
            onClick={() => setIsNewBriefModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Brief
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by scripture, topic, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 bg-white dark:bg-card border-border"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {FILTERS.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-colors",
                activeFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-white dark:bg-card border border-border text-foreground hover:bg-muted"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Active Project Section */}
        {activeProject && (
          <section className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Active Project
            </h2>
            <BriefCard
              brief={activeProject}
              variant="featured"
              onClick={() => handleSelectBrief(activeProject.id)}
            />
          </section>
        )}

        {/* Recent Library Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent Library
            </h2>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View All
            </button>
          </div>

          {filteredBriefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBriefs.map(brief => (
                <BriefCard
                  key={brief.id}
                  brief={brief}
                  onClick={() => handleSelectBrief(brief.id)}
                  onBookmark={() => handleBookmark(brief.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || activeFilter !== 'all'
                  ? 'No briefs match your filters'
                  : 'No briefs yet. Start by creating a new one!'}
              </p>
            </div>
          )}
        </section>
      </div>

      {/* New Brief Modal */}
      <NewBriefModal
        isOpen={isNewBriefModalOpen}
        onClose={() => setIsNewBriefModalOpen(false)}
      />
    </div>
  );
};

export default BriefsLibrary;
