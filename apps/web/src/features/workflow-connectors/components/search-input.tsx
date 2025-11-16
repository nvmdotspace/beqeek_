/**
 * Search Input Component
 *
 * Debounced search field to prevent excessive re-renders
 */

import { useState, useEffect, useCallback } from 'react';
import { Input } from '@workspace/ui/components/input';
import { Search } from 'lucide-react';

interface SearchInputProps {
  /** Placeholder text */
  placeholder: string;
  /** Callback fired after debounce delay */
  onSearch: (query: string) => void;
  /** Debounce delay in ms (default: 300) */
  debounceMs?: number;
  /** Optional class name */
  className?: string;
}

export function SearchInput({ placeholder, onSearch, debounceMs = 300, className }: SearchInputProps) {
  const [localValue, setLocalValue] = useState('');

  // Debounced effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(localValue);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onSearch]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <div className={`relative ${className || ''}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        className="pl-9"
        aria-label="Search connectors"
      />
    </div>
  );
}
