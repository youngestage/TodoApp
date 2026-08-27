import React, { useState } from 'react';
import { getBrandfetchCDNUrl, inferBrandDomain } from '../../services/brandfetchService';
import { Flash } from 'iconsax-react';

interface BrandLogoProps {
  title: string;
  brandDomain?: string;
  logoUrl?: string;
  fallbackIcon?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  title,
  brandDomain,
  logoUrl,
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);

  // Determine initial image source URL
  const domain = brandDomain || inferBrandDomain(title);
  const resolvedUrl = logoUrl || (domain ? getBrandfetchCDNUrl(domain) : null);

  // Dimensions
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl text-sm',
    md: 'w-11 h-11 rounded-2xl text-lg',
    lg: 'w-14 h-14 rounded-2xl text-2xl'
  }[size];

  const imgSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  }[size];

  // If error or no URL, show fallback
  if (hasError || !resolvedUrl) {
    const initialLetter = title ? title.trim().charAt(0).toUpperCase() : null;

    return (
      <div
        className={`${sizeClasses} bg-[#F6F3FA] text-[#8964B3] border border-[#EBE5F5] flex items-center justify-center font-bold shrink-0 shadow-2xs ${className}`}
        title={title}
      >
        {initialLetter ? (
          <span>{initialLetter}</span>
        ) : (
          <Flash size={size === 'sm' ? 14 : size === 'lg' ? 24 : 18} variant="Bulk" className="text-[#8964B3]" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses} bg-white border border-gray-100/80 shadow-xs flex items-center justify-center shrink-0 overflow-hidden p-1 ${className}`}
      title={title}
    >
      <img
        src={resolvedUrl}
        alt={`${title} logo`}
        className={`${imgSizeClasses} object-contain transition-transform hover:scale-105`}
        onError={() => setHasError(true)}
        loading="lazy"
      />
    </div>
  );
};
