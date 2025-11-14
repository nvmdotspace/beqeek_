/**
 * Field Options Editor Component
 *
 * Editor for select field options (text/value pairs).
 * Allows adding/removing/editing options.
 */

import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Plus, Trash2 } from 'lucide-react';

import type { Option } from '../types';

interface FieldOptionsEditorProps {
  options: Option[];
  onChange: (options: Option[]) => void;
}

export function FieldOptionsEditor({ options, onChange }: FieldOptionsEditorProps) {
  const handleAddOption = () => {
    onChange([...options, { text: '', value: '' }]);
  };

  const handleUpdateOption = (index: number, field: 'text' | 'value', value: string) => {
    const updated = options.map((opt, i) => (i === index ? { ...opt, [field]: value } : opt));
    onChange(updated);
  };

  const handleRemoveOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Label>
        Tùy chọn <span className="text-destructive">*</span>
      </Label>
      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={index} className="flex gap-2">
            <Input
              placeholder="Tên tùy chọn"
              value={option.text}
              onChange={(e) => handleUpdateOption(index, 'text', e.target.value)}
              className="flex-1 border border-input rounded-md bg-background text-foreground"
            />
            <Input
              placeholder="Giá trị"
              value={option.value}
              onChange={(e) => handleUpdateOption(index, 'value', e.target.value)}
              className="flex-1 border border-input rounded-md bg-background text-foreground"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => handleRemoveOption(index)}
              disabled={options.length === 1}
              title="Xóa tùy chọn"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" className="w-full" onClick={handleAddOption}>
          <Plus className="w-4 h-4 mr-2" />
          Thêm tùy chọn
        </Button>
      </div>
    </div>
  );
}
