'use client'

import React, { useCallback, useState } from 'react';
import { FileUp, FileText } from 'lucide-react';

interface DocumentDropZoneProps {
  onFileImport: (file: File) => void;
  onClickToStart: () => void;
}

export default function DocumentDropZone({ onFileImport, onClickToStart }: DocumentDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const docFile = files.find(f =>
      f.name.endsWith('.docx') || f.name.endsWith('.doc')
    );

    if (docFile) {
      onFileImport(docFile);
    }
  }, [onFileImport]);

  const handleFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.docx,.doc';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onFileImport(file);
      }
    };
    input.click();
  }, [onFileImport]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          w-full max-w-lg aspect-[4/3] rounded-2xl border-2 border-dashed
          flex flex-col items-center justify-center gap-6 p-8
          transition-all duration-300 cursor-pointer
          ${isDragOver
            ? 'border-primary bg-primary/5 scale-[1.02]'
            : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
          }
        `}
      >
        <div className={`
          w-16 h-16 rounded-2xl flex items-center justify-center
          transition-all duration-300
          ${isDragOver
            ? 'bg-primary/15 text-primary scale-110'
            : 'bg-muted text-muted-foreground'
          }
        `}>
          <FileUp className="h-8 w-8" />
        </div>

        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Start writing your sermon
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Drop a Word document here to import it, or start with a blank page
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleFileSelect}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <FileText className="h-4 w-4" />
            Import .docx file
          </button>
          <span className="text-xs text-muted-foreground">or</span>
          <button
            onClick={onClickToStart}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Start blank
          </button>
        </div>

        <p className="text-xs text-muted-foreground/70 text-center">
          You can also copy content from Google Docs and paste it directly
        </p>
      </div>
    </div>
  );
}
