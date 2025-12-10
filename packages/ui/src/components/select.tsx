import * as React from 'react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

const SelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  disabled: boolean;
  getDisplayText?: (value: string) => string;
}>({
  isOpen: false,
  setIsOpen: () => {},
  disabled: false,
});

export const Select: React.FC<SelectProps> = ({ value, onValueChange, disabled, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, disabled: disabled ?? false }}>
      <div className="relative overflow-visible">{children}</div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ children, className = '', ...props }, ref) => {
    const { isOpen, setIsOpen, disabled } = React.useContext(SelectContext);

    return (
      <button
        ref={ref}
        type="button"
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
          }
        }}
        className={`
          flex h-10 w-full items-center justify-between rounded-md border border-input
          bg-background px-3 py-2 text-sm placeholder:text-muted-foreground
          focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring
          disabled:cursor-not-allowed disabled:opacity-50
          transition-all
          ${className}
        `}
        disabled={disabled}
        {...props}
      >
        {children}
        <svg className="h-4 w-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  },
);
SelectTrigger.displayName = 'SelectTrigger';

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className = '', children }) => {
  const { value } = React.useContext(SelectContext);

  // If children provided, render them (for custom display)
  if (children && value) {
    return <span className={`block truncate ${className}`}>{children}</span>;
  }

  // Default: show value or placeholder
  return <span className={`block truncate ${className}`}>{value || placeholder}</span>;
};

export const SelectContent: React.FC<SelectContentProps> = ({ children, className = '' }) => {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={contentRef}
      className={`
        absolute top-full left-0 z-50 mt-1 max-h-96 w-full overflow-auto rounded-md border
        bg-popover text-popover-foreground shadow-md
        ${className}
      `}
    >
      <div className="p-1">{children}</div>
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps> = ({ value, children, className = '' }) => {
  const { onValueChange, setIsOpen } = React.useContext(SelectContext);

  const handleClick = () => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm
        outline-none hover:bg-accent hover:text-accent-foreground cursor-pointer
        ${className}
      `}
    >
      {children}
    </div>
  );
};
