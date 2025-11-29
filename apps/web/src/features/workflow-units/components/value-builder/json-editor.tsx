/**
 * JsonEditor - Monaco-based JSON editor for inline form fields
 *
 * Lightweight JSON editor with syntax highlighting and validation.
 */

import { useRef, useCallback } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useThemeStore } from '@/stores/theme-store';
import { cn } from '@workspace/ui/lib/utils';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export function JsonEditor({
  value,
  onChange,
  height = '120px',
  placeholder,
  className,
  readOnly = false,
}: JsonEditorProps) {
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoTheme = resolvedTheme === 'dark' ? 'vs-dark' : 'vs-light';

  const handleEditorDidMount = useCallback((editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;

    // Configure JSON defaults
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
    });
  }, []);

  const handleChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue !== undefined) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  return (
    <div
      className={cn(
        'border border-input rounded-md overflow-hidden',
        'focus-within:ring-1 focus-within:ring-ring',
        className,
      )}
    >
      <Editor
        height={height}
        language="json"
        value={value || placeholder || '{}'}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={monacoTheme}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'off',
          renderWhitespace: 'none',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          formatOnPaste: true,
          formatOnType: true,
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          folding: false,
          lineDecorationsWidth: 8,
          lineNumbersMinChars: 0,
          glyphMargin: false,
          scrollbar: {
            vertical: 'auto',
            horizontal: 'hidden',
            verticalScrollbarSize: 8,
          },
          overviewRulerBorder: false,
          hideCursorInOverviewRuler: true,
          readOnly,
          padding: { top: 8, bottom: 8 },
        }}
      />
    </div>
  );
}
