import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'cyan' | 'green' | 'orange' | 'red' | 'blue';
  trend?: string;
  trendPositive?: boolean;
}

const COLOR_MAP = {
  cyan: {
    border: 'border-cyan-500/30 hover:border-cyan-400',
    iconBg: 'bg-cyan-500/10 text-cyan-400',
    glow: 'hover:shadow-[0_0_20px_rgba(33,212,253,0.25)]',
    text: 'text-cyan-400',
  },
  green: {
    border: 'border-emerald-500/30 hover:border-emerald-400',
    iconBg: 'bg-emerald-500/10 text-emerald-400',
    glow: 'hover:shadow-[0_0_20px_rgba(37,217,149,0.25)]',
    text: 'text-emerald-400',
  },
  orange: {
    border: 'border-amber-500/30 hover:border-amber-400',
    iconBg: 'bg-amber-500/10 text-amber-400',
    glow: 'hover:shadow-[0_0_20px_rgba(255,170,66,0.25)]',
    text: 'text-amber-400',
  },
  red: {
    border: 'border-rose-500/30 hover:border-rose-400',
    iconBg: 'bg-rose-500/10 text-rose-400',
    glow: 'hover:shadow-[0_0_20px_rgba(255,75,92,0.25)]',
    text: 'text-rose-400',
  },
  blue: {
    border: 'border-blue-500/30 hover:border-blue-400',
    iconBg: 'bg-blue-500/10 text-blue-400',
    glow: 'hover:shadow-[0_0_20px_rgba(52,120,246,0.25)]',
    text: 'text-blue-400',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'cyan',
  trend,
  trendPositive,
}) => {
  const styles = COLOR_MAP[color];

  return (
    <div
      className={`glass-panel p-4 rounded-xl border ${styles.border} ${styles.glow} transition-all duration-300 relative overflow-hidden group`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
          {title}
        </span>
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-3xl font-extrabold tracking-tight font-mono text-white">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded ${
              trendPositive
                ? 'text-emerald-400 bg-emerald-500/10'
                : 'text-rose-400 bg-rose-500/10'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-400 mt-2 truncate font-mono">
          {subtitle}
        </p>
      )}

      {/* Decorative cyber corner */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-400/40" />
    </div>
  );
};

