import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { formatINR, formatINRShort } from '../../utils/currency';

interface KpiCardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: React.ReactNode;
  color: 'green' | 'red' | 'blue' | 'amber';
  format?: 'currency' | 'number' | 'percent';
  index?: number;
}

const colorMap = {
  green: {
    text: 'text-[var(--accent-green)]',
    glow: '0 0 20px rgba(13, 175, 110, 0.1)',
    icon: 'bg-[var(--accent-green)]/10 text-[var(--accent-green)]',
  },
  red: {
    text: 'text-[var(--accent-red)]',
    glow: '0 0 20px rgba(229, 54, 75, 0.1)',
    icon: 'bg-[var(--accent-red)]/10 text-[var(--accent-red)]',
  },
  blue: {
    text: 'text-[var(--accent-blue)]',
    glow: '0 0 20px rgba(43, 111, 232, 0.1)',
    icon: 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]',
  },
  amber: {
    text: 'text-[var(--accent-amber)]',
    glow: '0 0 20px rgba(217, 149, 21, 0.1)',
    icon: 'bg-[var(--accent-amber)]/10 text-[var(--accent-amber)]',
  },
};

function useCountUp(target: number, duration: number = 1200) {
  const [current, setCurrent] = useState(0);
  const start = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    const startTime = Date.now();
    start.current = 0;

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [target, duration]);

  return current;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon,
  color,
  format = 'currency',
  index = 0,
}: KpiCardProps) {
  const animatedValue = useCountUp(format === 'percent' ? 0 : value);
  const colors = colorMap[color];
  const displayValue =
    format === 'currency'
      ? formatINRShort(animatedValue)
      : format === 'percent'
        ? `${value}%`
        : animatedValue.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      className="bg-[var(--bg-surface)] border border-[var(--bg-border)] rounded-lg p-5 hover:border-[var(--bg-border-bright)] hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-body text-[var(--text-secondary)] uppercase tracking-wider">
            {title}
          </p>
          {subtitle && (
            <p className="text-[11px] font-body text-[var(--text-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110',
            colors.icon
          )}
        >
          {icon}
        </div>
      </div>

      <p
        className={cn(
          'text-2xl font-mono font-bold tracking-tight',
          colors.text
        )}
        style={{ textShadow: colors.glow }}
      >
        {displayValue}
      </p>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-2">
          <span
            className={cn(
              'text-xs font-mono font-medium',
              trend >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'
            )}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
          </span>
          {trendLabel && (
            <span className="text-xs text-[var(--text-muted)] font-body">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
