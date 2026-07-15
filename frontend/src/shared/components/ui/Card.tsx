import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated' | 'interactive';
  children: React.ReactNode;
}

export default function Card({
  variant = 'default',
  children,
  className = '',
  ...props
}: CardProps) {
  const baseStyles = 'rounded-xl border transition-all duration-200 overflow-hidden';
  
  const variantStyles = {
    default: 'bg-[#12141c] border-[#242936] text-[#f1f5f9] shadow-sm',
    glass: 'bg-[#12141c]/60 border-white/5 text-[#f1f5f9] backdrop-blur-md shadow-md',
    elevated: 'bg-[#1a1d29] border-[#242936] text-[#f1f5f9] shadow-lg hover:shadow-xl',
    interactive: 'bg-[#12141c] border-[#242936] text-[#f1f5f9] shadow-sm hover:border-indigo-500/30 hover:shadow-indigo-500/5 hover:-translate-y-0.5 cursor-pointer',
  };

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
