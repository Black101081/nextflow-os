import React from 'react';

interface SkeletonProps {
  variant?: 'line' | 'card' | 'avatar' | 'table';
  className?: string;
}

export default function Skeleton({ variant = 'line', className = '' }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-slate-800 rounded';

  if (variant === 'avatar') {
    return <div className={`${baseStyles} rounded-full w-10 h-10 ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`p-5 rounded-xl border border-slate-800 bg-slate-900/20 flex flex-col gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className={`${baseStyles} rounded-full w-10 h-10`} />
          <div className="flex flex-col gap-2 flex-1">
            <div className={`${baseStyles} h-4 w-1/3`} />
            <div className={`${baseStyles} h-3 w-1/4`} />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className={`${baseStyles} h-3.5 w-full`} />
          <div className={`${baseStyles} h-3.5 w-5/6`} />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`w-full flex flex-col gap-3.5 ${className}`}>
        <div className={`${baseStyles} h-10 w-full rounded-t-lg`} />
        <div className={`${baseStyles} h-8 w-full`} />
        <div className={`${baseStyles} h-8 w-full`} />
        <div className={`${baseStyles} h-8 w-full`} />
      </div>
    );
  }

  return <div className={`${baseStyles} h-4 w-full ${className}`} />;
}
