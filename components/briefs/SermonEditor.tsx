'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import mammoth from 'mammoth';
import EditorToolbar from './EditorToolbar';
import DocumentDropZone from './DocumentDropZone';

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error' | 'offline';

interface SermonEditorProps {
  briefId: string;
  initialContent: JSONContent | null;
  hasTranscript: boolean;
}

export default function SermonEditor({ briefId, initialContent, hasTranscript }: SermonEditorProps) {
  const [showDropZone, setShowDropZone] = useState(!initialContent && !hasTranscript);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isOnline, setIsOnline] = useState(true);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingContentRef = useRef<JSONContent | null>(null);

  // If a transcript comes in (e.g. after recording finishes), hide the drop zone
  useEffect(() => {
    if (hasTranscript && showDropZone && !initialContent) {
      setShowDropZone(false);
    }
  }, [hasTranscript, initialContent, showDropZone]);

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Retry any pending save when connection returns
      if (pendingContentRef.current) {
        saveContent(pendingContentRef.current);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSaveStatus('offline');
    };

    // Set initial state
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      setSaveStatus('offline');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: initialContent || undefined,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'sermon-editor-content outline-none min-h-[60vh] px-8 py-6 sm:px-12 sm:py-8',
      },
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('unsaved');

      // Debounced auto-save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveContent(editor.getJSON());
      }, 2000);
    },
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const saveContent = useCallback(async (content: JSONContent) => {
    // If we already know we're offline, store and wait
    if (!navigator.onLine) {
      pendingContentRef.current = content;
      setSaveStatus('offline');
      return;
    }

    setSaveStatus('saving');
    try {
      const response = await fetch(`/api/briefs/${briefId}/sermon`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setSaveStatus('saved');
        pendingContentRef.current = null;
      } else {
        setSaveStatus('error');
        pendingContentRef.current = content;
      }
    } catch (err) {
      // TypeError from fetch = network failure (offline, DNS, etc.)
      pendingContentRef.current = content;
      if (err instanceof TypeError) {
        setSaveStatus('offline');
      } else {
        setSaveStatus('error');
      }
    }
  }, [briefId]);

  const handleFileImport = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });

      if (editor) {
        editor.commands.setContent(result.value);
        setShowDropZone(false);

        // Save immediately after import
        setTimeout(() => {
          saveContent(editor.getJSON());
        }, 100);
      }
    } catch (error) {
      console.error('Error importing document:', error);
    }
  }, [editor, saveContent]);

  const handleStartBlank = useCallback(() => {
    setShowDropZone(false);
    editor?.commands.focus();
  }, [editor]);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileImport(file);
    }
    e.target.value = '';
  }, [handleFileImport]);

  // Handle drag-and-drop on the editor itself
  const handleEditorDrop = useCallback((e: React.DragEvent) => {
    const files = Array.from(e.dataTransfer.files);
    const docFile = files.find(f =>
      f.name.endsWith('.docx') || f.name.endsWith('.doc')
    );

    if (docFile) {
      e.preventDefault();
      e.stopPropagation();
      handleFileImport(docFile);
    }
  }, [handleFileImport]);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Hidden file input for import button */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.doc"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {showDropZone ? (
        <DocumentDropZone
          onFileImport={handleFileImport}
          onClickToStart={handleStartBlank}
        />
      ) : (
        <>
          {/* Toolbar with save status integrated */}
          <EditorToolbar
            editor={editor}
            onImportFile={handleImportClick}
            saveStatus={saveStatus}
          />

          {/* Editor Area */}
          <div
            className="flex-1 overflow-y-auto"
            onDrop={handleEditorDrop}
            onDragOver={(e) => {
              if (e.dataTransfer.types.includes('Files')) {
                e.preventDefault();
              }
            }}
          >
            <div className="max-w-3xl mx-auto">
              <EditorContent editor={editor} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
