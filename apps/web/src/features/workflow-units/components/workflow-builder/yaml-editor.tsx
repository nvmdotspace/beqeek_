/**
 * YamlEditor Component
 *
 * Monaco-based YAML editor with syntax highlighting and validation.
 * Uses monaco-yaml for YAML language support.
 * Supports dark/light theme switching.
 */

import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Alert, AlertDescription } from '@workspace/ui/components/alert';
import { AlertCircle } from 'lucide-react';
import { useWorkflowEditorStore } from '../../stores/workflow-editor-store';

interface YamlEditorProps {
  _workspaceId: string;
}

export function YamlEditor({ _workspaceId }: YamlEditorProps) {
  const { yamlContent, yamlError, setYamlContent, setYamlError } = useWorkflowEditorStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Detect dark mode from DOM (more reliable than context)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  // Watch for dark mode changes via MutationObserver
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Set initial value
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    return () => observer.disconnect();
  }, []);

  // Determine Monaco theme based on detected dark mode
  const monacoTheme = isDarkMode ? 'vs-dark' : 'light';

  // Handle editor mount
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Configure monaco-yaml
    // Note: monaco-yaml auto-registers itself when imported
    // We'll configure it in a separate effect
  };

  // Update Monaco theme when app theme changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(monacoTheme);
    }
  }, [monacoTheme]);

  // Configure monaco-yaml after mount
  useEffect(() => {
    if (!monacoRef.current) return;

    const setupYamlLanguage = async () => {
      try {
        // Import monaco-yaml for side effects (registers YAML language)
        await import('monaco-yaml');

        // monaco-yaml will automatically configure itself
        // We can optionally add custom validation schemas here in the future
        console.log('[YamlEditor] YAML language support loaded');
      } catch (error) {
        console.error('[YamlEditor] Failed to load YAML support:', error);
      }
    };

    setupYamlLanguage();
  }, []);

  // Handle content change
  const handleChange = (value: string | undefined) => {
    if (value !== undefined) {
      setYamlContent(value);
      // Clear error on edit (validation will happen on mode switch)
      setYamlError(null);
    }
  };

  return (
    <div className="h-full w-full flex flex-col" role="region" aria-label="YAML code editor">
      {/* Validation Error Alert */}
      {yamlError && (
        <div className="p-4 border-b bg-background">
          <Alert variant="destructive" role="alert" aria-live="assertive">
            <AlertCircle className="h-4 w-4" aria-hidden="true" />
            <AlertDescription>
              <strong>YAML Validation Error:</strong> {yamlError}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1" aria-label="YAML code input area">
        <Editor
          key={monacoTheme}
          height="100%"
          language="yaml"
          value={yamlContent}
          onChange={handleChange}
          onMount={handleEditorDidMount}
          theme={monacoTheme}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'boundary',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>
    </div>
  );
}
