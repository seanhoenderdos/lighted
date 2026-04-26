'use client'

import React from 'react';
import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Undo2,
  Redo2,
  FileUp,
  FileDown,
  FileText,
  FileArchive,
  Check,
  Loader2,
  WifiOff,
  AlertCircle,
} from 'lucide-react';
import { type SaveStatus } from './SermonEditor';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { asBlob } from 'html-docx-js-typescript';
import { saveAs } from 'file-saver';
import { toast } from 'sonner';

interface EditorToolbarProps {
  editor: Editor | null;
  onImportFile: () => void;
  saveStatus: SaveStatus;
}

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed ${
        isActive 
          ? 'text-primary bg-primary/15' 
          : 'text-primary hover:text-foreground hover:bg-muted'
      }`}
      style={{ opacity: disabled ? 0.4 : 1 }}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-1" />;
}

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saved':
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5" />
          Saved
        </span>
      );
    case 'saving':
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving...
        </span>
      );
    case 'unsaved':
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin opacity-50" />
          Saving...
        </span>
      );
    case 'offline':
      return (
        <span className="flex items-center gap-1.5 text-xs text-amber-600">
          <WifiOff className="h-3.5 w-3.5" />
          Offline — will save when connected
        </span>
      );
    case 'error':
      return (
        <span className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5" />
          Save failed
        </span>
      );
    default:
      return null;
  }
}

export default function EditorToolbar({ editor, onImportFile, saveStatus }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      {/* Left: Formatting controls */}
      <div className="flex items-center gap-0.5 flex-wrap">
        {/* Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Import */}
        <ToolbarButton
          onClick={onImportFile}
          title="Import Word Document"
        >
          <FileUp className="h-4 w-4" />
        </ToolbarButton>

        {/* Export */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              title="Export Document"
              className="p-1.5 px-2 rounded-md transition-colors duration-150 cursor-pointer text-primary hover:text-foreground hover:bg-muted flex items-center justify-center gap-1.5 ml-2 text-sm font-medium"
            >
              <FileDown className="h-4 w-4" />
              <span>Export</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => window.print()} className="cursor-pointer">
              <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
              Export to PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={async () => {
              try {
                const htmlString = `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <title>Sermon Export</title>
                  </head>
                  <body>
                    ${editor.getHTML()}
                  </body>
                  </html>
                `;
                const blob = await asBlob(htmlString);
                saveAs(blob as Blob, 'Sermon_Workspace.docx');
                toast.success('Document exported successfully');
              } catch (error) {
                console.error('Export error:', error);
                toast.error('Failed to export document');
              }
            }} className="cursor-pointer">
              <FileArchive className="h-4 w-4 mr-2 text-muted-foreground" />
              Export to Word (.docx)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Right: Save status */}
      <SaveStatusIndicator status={saveStatus} />
    </div>
  );
}
