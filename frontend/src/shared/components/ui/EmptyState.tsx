import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon = <Inbox size={36} className="text-slate-600" />,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 border border-dashed border-[#242936] rounded-xl bg-[#12141c]/20 backdrop-blur-sm ${className}`}
    >
      <div className="p-3 bg-[#1a1d29]/60 rounded-full border border-[#242936] mb-4">
        {icon}
      </div>
      <h4 className="text-sm font-semibold text-white tracking-tight mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-xs mb-5 leading-relaxed">{description}</p>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
