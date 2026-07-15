import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'neutral';
  children: React.ReactNode;
}

export default function Badge({
  variant = 'neutral',
  children,
  className = '',
  ...props
}: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border';
  
  const variantStyles = {
    primary: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
    secondary: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    success: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    neutral: 'bg-slate-500/10 border-slate-500/30 text-slate-400',
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
