import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'tangerine' | 'saffron' | 'wisteria' | 'sage' | 'muted';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'muted',
  className = '',
  icon
}) => {
  const variantStyles = {
    tangerine: 'bg-[#FFF5F0] text-[#EF713F]',
    saffron: 'bg-[#FAF6EB] text-[#CF9130]',
    wisteria: 'bg-[#F6F3FA] text-[#8964B3]',
    sage: 'bg-[#EBF3ED] text-[#4A7C59]',
    muted: 'bg-[#F5F3EF] text-[#6B6560]'
  };

  return (
    <span
      className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
