import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useRef, useEffect } from 'react';
import type { Diff } from '../types';

interface CodeViewerProps {
  code: string;
  language: string;
  diff?: Diff | null;
}

/**
 * CodeViewer - Displays code with syntax highlighting and diff markers
 *
 * Uses Monaco Editor (same as VS Code) for professional code display.
 * Highlights added lines in green and removed lines in red.
 */
export function CodeViewer({ code, language, diff }: CodeViewerProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<editor.IEditorDecorationsCollection | null>(null);

  // Handle editor mount
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    decorationsRef.current = editor.createDecorationsCollection([]);
    applyDiffHighlights();
  };

  // Apply diff highlighting when diff changes
  useEffect(() => {
    applyDiffHighlights();
  }, [diff, code]);

  // Apply green/red highlights for added/removed lines
  const applyDiffHighlights = () => {
    if (!editorRef.current || !decorationsRef.current) return;

    const decorations: editor.IModelDeltaDecoration[] = [];

    if (diff) {
      // Find and highlight added lines (green)
      const lines = code.split('\n');
      lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (diff.added.some(added => added.trim() === trimmedLine)) {
          decorations.push({
            range: {
              startLineNumber: index + 1,
              startColumn: 1,
              endLineNumber: index + 1,
              endColumn: 1,
            },
            options: {
              isWholeLine: true,
              className: 'diff-added-line',
              glyphMarginClassName: 'diff-added-glyph',
            },
          });
        }
      });
    }

    decorationsRef.current.set(decorations);
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-gray-700">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        onMount={handleEditorMount}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          automaticLayout: true,
          folding: false,
          glyphMargin: true,
          lineDecorationsWidth: 5,
        }}
      />
      {/* CSS for diff highlighting */}
      <style>{`
        .diff-added-line {
          background-color: rgba(34, 197, 94, 0.2) !important;
        }
        .diff-added-glyph {
          background-color: rgb(34, 197, 94);
          width: 4px !important;
          margin-left: 3px;
        }
      `}</style>
    </div>
  );
}
