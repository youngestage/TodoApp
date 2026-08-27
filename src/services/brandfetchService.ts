export interface BrandfetchSearchResult {
  name: string;
  domain: string;
  icon?: string;
  claimed?: boolean;
  brandId?: string;
}

// Optional Brandfetch Client ID from environment variables
const CLIENT_ID = import.meta.env.VITE_BRANDFETCH_CLIENT_ID || '';

/**
 * Constructs a Brandfetch CDN URL for a given domain dynamically
 */
export const getBrandfetchCDNUrl = (domain: string): string => {
  if (!domain) return '';
  const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').trim();
  const queryParam = CLIENT_ID ? `?c=${encodeURIComponent(CLIENT_ID)}` : '';
  return `https://cdn.brandfetch.io/${cleanDomain}${queryParam}`;
};

/**
 * Dynamically infers a domain from a title if no explicit domain was chosen from search.
 * E.g., "Netflix Premium 4K" -> "netflix.com"
 * E.g., "Spotify Family" -> "spotify.com"
 * E.g., "Canva Pro" -> "canva.com"
 */
export const inferBrandDomain = (title: string): string | null => {
  if (!title) return null;

  const trimmed = title.trim();

  // If user entered a domain directly (e.g. "github.com")
  if (trimmed.includes('.')) {
    return trimmed.toLowerCase();
  }

  // Extract primary brand word (e.g. "Netflix" from "Netflix Premium 4K")
  const primaryWord = trimmed.split(/\s+/)[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  if (primaryWord.length >= 2) {
    return `${primaryWord}.com`;
  }

  return null;
};

/**
 * Dynamically queries Brandfetch Brand Search API for matching brands by query string.
 * Endpoint: https://api.brandfetch.io/v2/search/{name}
 */
export const searchBrandfetch = async (query: string): Promise<BrandfetchSearchResult[]> => {
  if (!query || query.trim().length < 2) return [];

  const trimmed = query.trim().toLowerCase();
  const queryParam = CLIENT_ID ? `?c=${encodeURIComponent(CLIENT_ID)}` : '';

  try {
    const res = await fetch(`https://api.brandfetch.io/v2/search/${encodeURIComponent(trimmed)}${queryParam}`);
    if (res.ok) {
      const data: BrandfetchSearchResult[] = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((b) => ({
          ...b,
          icon: b.icon || getBrandfetchCDNUrl(b.domain)
        }));
      }
    }
  } catch (err) {
    console.warn('Brandfetch API live search network error:', err);
  }

  return [];
};
