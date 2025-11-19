/**
 * ShortcutsHelpDialog - Keyboard shortcuts reference dialog
 */

import { Keyboard } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@workspace/ui/components/dialog';
import { Stack } from '@workspace/ui/components/primitives/stack';
import { Inline } from '@workspace/ui/components/primitives/inline';
import { Text } from '@workspace/ui/components/typography';

interface ShortcutsHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ['Escape'], description: 'Go back / Cancel editing' },
  { keys: ['⌘/Ctrl', 'S'], description: 'Save changes (when editing)' },
  { keys: ['⌘/Ctrl', 'E'], description: 'Enter edit mode' },
  { keys: ['⌘/Ctrl', '/'], description: 'Show this help dialog' },
];

export function ShortcutsHelpDialog({ open, onOpenChange }: ShortcutsHelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="size-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>Use these shortcuts to navigate and edit records faster</DialogDescription>
        </DialogHeader>

        <Stack space="space-200" className="py-4">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
              <Text size="small">{shortcut.description}</Text>
              <Inline space="space-100" className="flex-shrink-0">
                {shortcut.keys.map((key, keyIndex) => (
                  <kbd
                    key={keyIndex}
                    className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded"
                  >
                    {key}
                  </kbd>
                ))}
              </Inline>
            </div>
          ))}
        </Stack>

        <Text size="small" className="text-muted-foreground text-center pt-2">
          Press <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">⌘/Ctrl</kbd> +{' '}
          <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">/</kbd> to toggle this dialog
        </Text>
      </DialogContent>
    </Dialog>
  );
}
