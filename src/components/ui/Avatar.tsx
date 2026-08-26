import React from 'react';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  isOnline?: boolean;
  className?: string;
  badgeContent?: React.ReactNode;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  isOnline,
  className = '',
  badgeContent
}) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const initial = (name || '?').charAt(0).toUpperCase();
  const bgGradient = 'from-[#EF713F] to-[#E9C277]';

  return (
    <div className="relative inline-block">
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover shadow-none ${className}`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr ${bgGradient} text-white font-zodiak font-bold flex items-center justify-center shadow-none ${className}`}
        >
          {initial}
        </div>
      )}

      {isOnline !== undefined && (
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
            isOnline ? 'bg-[#4A7C59] animate-pulse' : 'bg-slate-300'
          }`}
        />
      )}

      {badgeContent && (
        <div className="absolute -bottom-1 -right-1">
          {badgeContent}
        </div>
      )}
    </div>
  );
};
