import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, suffix, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium font-body text-[var(--text-secondary)] uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[var(--bg-base)] border border-[var(--bg-border)] rounded-lg px-3 py-2.5 text-sm font-body text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200',
              'focus:outline-none focus:border-[var(--bg-border-bright)] focus:ring-1 focus:ring-[var(--accent-blue)]/30',
              'hover:border-[var(--bg-border-bright)]',
              icon && 'pl-10',
              suffix && 'pr-10',
              error && 'border-[var(--accent-red)]  focus:ring-[var(--accent-red)]/30',
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {suffix}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-[var(--accent-red)] font-body">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
