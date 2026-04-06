import React from 'react';
import { cn } from '../../utils/cn';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'danger' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[var(--accent-green)] text-white hover:bg-[var(--accent-green)]/90 shadow-[0_0_20px_rgba(13,175,110,0.15)]',
  danger:
    'bg-[var(--accent-red)] text-white hover:bg-[var(--accent-red)]/90 shadow-[0_0_20px_rgba(255,59,92,0.15)]',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
  outline:
    'bg-transparent border border-[var(--bg-border)] text-[var(--text-secondary)] hover:border-[var(--bg-border-bright)] hover:text-[var(--text-primary)]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-body font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)]/50 focus:ring-offset-1 focus:ring-offset-[var(--bg-base)] disabled:opacity-50 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
