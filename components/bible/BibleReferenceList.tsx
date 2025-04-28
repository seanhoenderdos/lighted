'use client'

import { useState, useEffect } from 'react';
import BibleReference from './BibleReference';
import { detectBibleReferences } from '@/ai/ai-instance';

interface BibleReferenceListProps {
  text: string;
  onSelectReference?: (reference: string) => void;
}

export default function BibleReferenceList({ text, onSelectReference }: BibleReferenceListProps) {
  const [references, setReferences] = useState<Array<{ reference: string; context?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!text || text.length < 10) return;

    const extractReferences = async () => {
      setIsLoading(true);
      try {
        const detectedReferences = await detectBibleReferences(text);
        setReferences(detectedReferences);
      } catch (error) {
        console.error('Error detecting Bible references:', error);
      } finally {
        setIsLoading(false);
      }
    };

    extractReferences();
  }, [text]);

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Finding Bible references...</div>;
  }

  if (references.length === 0) {
    return null;
  }

  return (
    <div className="mt-2">
      <h3 className="text-sm font-medium mb-2">Related Bible Passages</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {references.map((ref, index) => (
          <BibleReference 
            key={index} 
            reference={ref.reference}
            context={ref.context}
            onSelect={onSelectReference}
          />
        ))}
      </div>
    </div>
  );
}