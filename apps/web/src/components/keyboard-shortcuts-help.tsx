import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@workspace/ui/components/dialog';
import { Button } from '@workspace/ui/components/button';
import { Badge } from '@workspace/ui/components/badge';
import { Keyboard, X } from 'lucide-react';
import { useAppKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

interface KeyboardShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KeyboardShortcutsHelp = ({ open, onOpenChange }: KeyboardShortcutsHelpProps) => {
  const shortcuts = useAppKeyboardShortcuts();

  const formatShortcut = (shortcut: (typeof shortcuts)[0]) => {
    const parts: string[] = [];

    if (shortcut.ctrlKey) parts.push('Ctrl');
    if (shortcut.metaKey) parts.push('Cmd');
    if (shortcut.shiftKey) parts.push('Shift');
    if (shortcut.altKey) parts.push('Alt');
    parts.push(shortcut.key.toUpperCase());

    return parts.join(' + ');
  };

  const groupedShortcuts = shortcuts.reduce(
    (groups, shortcut) => {
      const category = shortcut.description.includes('Go to')
        ? 'Navigation'
        : shortcut.description.includes('Sidebar')
          ? 'Sidebar'
          : shortcut.description.includes('Search') || shortcut.description.includes('Command')
            ? 'Quick Actions'
            : shortcut.description.includes('Workspace')
              ? 'Workspace'
              : 'Help';

      if (!groups[category]) groups[category] = [];
      groups[category].push(shortcut);
      return groups;
    },
    {} as Record<string, typeof shortcuts>,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3">{category}</h3>
              <div className="grid gap-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <span className="text-sm font-medium">{shortcut.description}</span>
                    <Badge variant="secondary" className="font-mono text-xs">
                      {formatShortcut(shortcut)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>Tip:</strong> Keyboard shortcuts don't work when you're typing in input fields or text areas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Button to trigger the help dialog
export const KeyboardShortcutsButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-foreground"
      >
        <Keyboard className="h-4 w-4 mr-2" />
        Keyboard Shortcuts
      </Button>

      <KeyboardShortcutsHelp open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
