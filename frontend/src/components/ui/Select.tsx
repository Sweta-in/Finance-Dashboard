import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-medium font-body text-[var(--text-secondary)] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-lg px-3 py-2.5 text-sm font-body text-[var(--text-primary)] appearance-none transition-all duration-200',
              'focus:outline-none focus:border-[var(--bg-border-bright)] focus:ring-1 focus:ring-[var(--accent-blue)]/30',
              'hover:border-[var(--bg-border-bright)]',
              error && 'border-[var(--accent-red)] focus:ring-[var(--accent-red)]/30',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" className="text-[var(--text-muted)]">
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        {error && (
          <p className="text-xs text-[var(--accent-red)] font-body">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
