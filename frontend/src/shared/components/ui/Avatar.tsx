import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

export default function Avatar({
  src,
  name,
  size = 'md',
  status,
  className = '',
}: AvatarProps) {
  const getInitials = (fullName: string) => {
    const parts = fullName.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  };

  const statusColors = {
    online: 'bg-emerald-500 ring-2 ring-[#0b0c10]',
    offline: 'bg-slate-500 ring-2 ring-[#0b0c10]',
    busy: 'bg-rose-500 ring-2 ring-[#0b0c10]',
    away: 'bg-amber-500 ring-2 ring-[#0b0c10]',
  };

  const statusSize = {
    sm: 'w-2.5 h-2.5 bottom-0 right-0',
    md: 'w-3 h-3 bottom-0 right-0',
    lg: 'w-4 h-4 bottom-0.5 right-0.5',
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeStyles[size]} rounded-full object-cover border border-[#242936]`}
        />
      ) : (
        <div
          className={`${sizeStyles[size]} rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 border border-white/10 flex items-center justify-center font-bold text-white shadow-md`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute rounded-full ${statusColors[status]} ${statusSize[size]}`}
        />
      )}
    </div>
  );
}
