/**
 * Multi-Select Field Component
 *
 * Lightweight dropdown without Radix popover to avoid recursive ref updates
 * that previously caused "Maximum update depth exceeded" errors when selecting items.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import { cn } from '@workspace/ui/lib/utils';

export interface MultiSelectFieldProps {
  /** Unique ID for accessibility */
  id: string;
  /** Available options */
  options: Array<{ value: string; label: string; textColor?: string; backgroundColor?: string }>;
  /** Currently selected values */
  value: string[];
  /** Callback when selection changes */
  onChange: (values: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional class name */
  className?: string;
  /** Disable interactions */
  disabled?: boolean;
}

export function MultiSelectField({
  id,
  options,
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
}: MultiSelectFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const normalizedValue = Array.isArray(value) ? value : [];

  const selectedOptions = useMemo(
    () => options.filter((option) => normalizedValue.includes(option.value)),
    [normalizedValue, options],
  );

  const filteredOptions = useMemo(() => {
    if (!search.trim()) {
      return options;
    }
    const keyword = search.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(keyword));
  }, [options, search]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const toggleOption = (optionValue: string) => {
    if (normalizedValue.includes(optionValue)) {
      onChange(normalizedValue.filter((v) => v !== optionValue));
    } else {
      onChange([...normalizedValue, optionValue]);
    }
  };

  const handleRemove = (optionValue: string) => {
    onChange(normalizedValue.filter((v) => v !== optionValue));
  };

  return (
    <div ref={containerRef} className={cn('space-y-2 relative', className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
        className={cn(
          'flex min-h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-left text-sm shadow-xs transition-all',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <span className={cn('truncate', selectedOptions.length === 0 && 'text-muted-foreground')}>
          {selectedOptions.length > 0 ? `${selectedOptions.length} selected` : placeholder || 'Select fields...'}
        </span>
        <svg
          className={cn('h-4 w-4 opacity-60 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <Badge key={option.value} variant="secondary" className="gap-1">
              {option.label}
              <button
                type="button"
                className="ml-1 rounded-full p-0.5 hover:bg-muted"
                aria-label={`Remove ${option.label}`}
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemove(option.value);
                }}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-input bg-popover shadow-xl">
          <div className="border-b border-border/70 p-2">
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search fields..."
              className="h-9"
            />
          </div>
          <div className="max-h-64 overflow-auto p-1">
            {filteredOptions.length === 0 && (
              <p className="px-2 py-4 text-sm text-muted-foreground">No options available</p>
            )}
            {filteredOptions.map((option) => {
              const isSelected = normalizedValue.includes(option.value);
              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                    'hover:bg-accent/50',
                    isSelected && 'bg-accent/30',
                  )}
                  onClick={() => toggleOption(option.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleOption(option.value);
                    }
                  }}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border border-input text-[var(--brand-primary)] focus:ring-ring"
                      checked={isSelected}
                      onChange={(event) => {
                        event.stopPropagation();
                        toggleOption(option.value);
                      }}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </span>
                  <span
                    className="flex items-center gap-2 truncate"
                    style={
                      option.textColor
                        ? {
                            color: option.textColor,
                          }
                        : undefined
                    }
                  >
                    {option.backgroundColor && (
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-border"
                        style={{ backgroundColor: option.backgroundColor }}
                      />
                    )}
                    {option.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
