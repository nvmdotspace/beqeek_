/**
 * Multi-Select Field Component
 *
 * A reusable multi-select component for selecting multiple fields
 */

import { useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Popover, PopoverContent, PopoverTrigger } from '@workspace/ui/components/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@workspace/ui/components/command';
import { cn } from '@workspace/ui/lib/utils';

export interface MultiSelectFieldProps {
  /** Unique ID for accessibility */
  id: string;

  /** Available options */
  options: Array<{ value: string; label: string }>;

  /** Currently selected values */
  value: string[];

  /** Callback when selection changes */
  onChange: (values: string[]) => void;

  /** Placeholder text */
  placeholder?: string;

  /** Optional class name */
  className?: string;
}

/**
 * Multi-Select Field Component
 */
export function MultiSelectField({ id, options, value, onChange, placeholder, className }: MultiSelectFieldProps) {
  const [open, setOpen] = useState(false);

  const selectedOptions = options.filter((opt) => value.includes(opt.value));

  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start text-left font-normal"
          >
            {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : placeholder || 'Select fields...'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search fields..." />
            <CommandEmpty>No fields found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                          isSelected ? 'bg-primary text-primary-foreground' : 'opacity-50 [&_svg]:invisible',
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3 w-3"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>{option.label}</span>
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Items */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant="secondary" className="gap-1">
              {option.label}
              <button
                type="button"
                onClick={() => handleRemove(option.value)}
                className="ml-1 rounded-full hover:bg-muted"
                aria-label={`Remove ${option.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
