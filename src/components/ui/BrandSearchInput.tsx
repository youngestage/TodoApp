import React, { useState, useEffect, useRef } from 'react';
import { BrandfetchSearchResult, searchBrandfetch } from '../../services/brandfetchService';
import { SearchNormal1, Flash, Global } from 'iconsax-react';

interface BrandSearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onSelectBrand: (brand: { name: string; domain: string; logoUrl: string }) => void;
  placeholder?: string;
  className?: string;
}

export const BrandSearchInput: React.FC<BrandSearchInputProps> = ({
  value,
  onChange,
  onSelectBrand,
  placeholder = 'Search company (e.g. Netflix, Spotify, Canva...)',
  className = ''
}) => {
  const [results, setResults] = useState<BrandfetchSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const data = await searchBrandfetch(value);
      setResults(data);
      setIsLoading(false);
      setIsOpen(data.length > 0);
    }, 200);

    return () => clearTimeout(timer);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: BrandfetchSearchResult) => {
    onSelectBrand({
      name: item.name,
      domain: item.domain,
      logoUrl: item.icon || `https://cdn.brandfetch.io/${item.domain}`
    });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          required
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={`w-full bg-[#FBF9F5] border border-transparent focus:border-[#8964B3]/30 rounded-xl p-3 pr-10 text-xs sm:text-sm text-[#231F1E] focus:outline-none transition-all ${className}`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-[#8964B3] border-t-transparent rounded-full animate-spin" />
          ) : (
            <SearchNormal1 size={16} className="text-[#8964B3]" />
          )}
        </div>
      </div>

      {/* Brandfetch Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 max-h-60 overflow-y-auto space-y-1 select-none animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-2 py-1 border-b border-gray-100 text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider">
            <span className="flex items-center space-x-1">
              <Flash size={12} className="text-[#8964B3]" variant="Bold" />
              <span>Search Suggestions</span>
            </span>
            <span>{results.length} found</span>
          </div>

          {results.map((item, idx) => (
            <button
              key={`${item.domain}-${idx}`}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full text-left p-2.5 rounded-xl hover:bg-[#F6F3FA] transition-colors border-0 cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                  {item.icon && item.icon.startsWith('http') ? (
                    <img
                      src={item.icon}
                      alt={item.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <Global size={16} className="text-[#8964B3]" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-semibold text-xs text-[#231F1E] group-hover:text-[#8964B3] truncate">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono truncate">
                    {item.domain}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-mono font-medium text-gray-500 group-hover:bg-[#8964B3] group-hover:text-white transition-colors shrink-0">
                Select
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
