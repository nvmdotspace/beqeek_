import * as React from 'react';
import { HexColorPicker } from 'react-colorful';

import { cn } from '../lib/utils.js';
import { Button } from './button.js';
import { Popover, PopoverContent, PopoverTrigger } from './popover.js';

// Define the props that HexColorPicker accepts based on its usage
type HexColorPickerProps = {
  color: string;
  onChange: (color: string) => void;
  className?: string;
};

type ColorPickerBaseProps = Omit<HexColorPickerProps, 'color' | 'onChange'>;

interface ColorPickerProps extends ColorPickerBaseProps {
  /**
   * Giá trị màu hiện tại (mặc định dạng hex, ví dụ #1E293B).
   */
  color: string;
  /**
   * Callback khi người dùng chọn màu mới.
   */
  onChange: (color: string) => void;
  /**
   * Nhãn trợ năng cho trigger button (ẩn với thị giác).
   */
  label?: string;
  /**
   * Vô hiệu hoá trigger & picker.
   */
  disabled?: boolean;
  /**
   * Tùy biến class cho nút trigger hiển thị swatch.
   */
  triggerClassName?: string;
  /**
   * Tùy biến class cho popover container.
   */
  popoverClassName?: string;
  /**
   * Hiển thị văn bản chú thích ngay dưới mã màu.
   */
  description?: string;
  /**
   * Bổ sung class cho vùng picker (forward tới `react-colorful`).
   */
  className?: string;
}

const ColorPicker = React.forwardRef<React.ElementRef<typeof PopoverTrigger>, ColorPickerProps>(
  (
    {
      color,
      onChange,
      label = 'Chọn màu',
      disabled = false,
      triggerClassName,
      popoverClassName,
      description,
      className,
      ...props
    },
    ref,
  ) => {
    const colorLabel = color?.toUpperCase();

    return (
      <Popover>
        <PopoverTrigger ref={ref} asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={label}
            disabled={disabled}
            style={{ backgroundColor: disabled ? undefined : color }}
            className={cn(
              'size-10 rounded-full border border-input bg-background p-0 ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              disabled && 'opacity-60',
              triggerClassName,
            )}
          >
            <span aria-hidden className="inline-block size-full rounded-full border border-background/40" />
            <span className="sr-only">{label}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className={cn('w-auto p-4', popoverClassName)} sideOffset={8}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col text-sm">
                <span className="font-medium text-foreground">{colorLabel}</span>
                {description ? <span className="text-muted-foreground">{description}</span> : null}
              </div>
              <span
                aria-hidden
                className="size-6 rounded-full border border-border shadow-inner"
                style={{ backgroundColor: color }}
              />
            </div>
            <HexColorPicker color={color} onChange={onChange} className={cn('h-40 w-40', className)} {...props} />
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
ColorPicker.displayName = 'ColorPicker';

export { ColorPicker };
