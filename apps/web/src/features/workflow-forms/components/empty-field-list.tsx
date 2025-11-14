/**
 * Empty Field List Component
 *
 * Displayed when there are no fields in the form.
 * Shows call-to-action to add first field.
 */

import { Button } from '@workspace/ui/components/button';
import { Plus } from 'lucide-react';

interface EmptyFieldListProps {
  onAddField: () => void;
}

export function EmptyFieldList({ onAddField }: EmptyFieldListProps) {
  return (
    <div className="border border-dashed border-border rounded-lg p-8 text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-muted p-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 7h.01" />
            <path d="M11 7h6" />
            <path d="M7 12h.01" />
            <path d="M11 12h6" />
            <path d="M7 17h.01" />
            <path d="M11 17h6" />
          </svg>
        </div>
      </div>
      <h3 className="text-lg font-semibold mb-2">Chưa có field nào</h3>
      <p className="text-sm text-muted-foreground mb-4">Thêm field đầu tiên để xây dựng form của bạn</p>
      <Button onClick={onAddField}>
        <Plus className="w-4 h-4 mr-2" />
        Thêm Field
      </Button>
    </div>
  );
}
