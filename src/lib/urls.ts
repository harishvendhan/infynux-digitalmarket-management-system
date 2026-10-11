export type PlatformType = 'instagram' | 'youtube' | 'facebook' | 'linkedin' | 'tiktok' | 'generic';

/**
 * Validates whether a given string is a valid HTTP or HTTPS URL.
 */
export function isValidHttpUrl(stringToTest: string | null | undefined): boolean {
  if (!stringToTest || stringToTest.trim() === '') return false;
  try {
    const url = new URL(stringToTest);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Detects the social media platform from a given URL.
 */
export function detectPlatform(url: string | null | undefined): PlatformType {
  if (!url) return 'generic';
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.me')) return 'facebook';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('tiktok.com')) return 'tiktok';
  return 'generic';
}

export function formatUrlDisplay(url: string, maxLength = 32): string {
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname;
    const combined = `${domain}${path}`;
    if (combined.length <= maxLength) return combined;
    return `${combined.slice(0, maxLength)}...`;
  } catch {
    return url.length > maxLength ? `${url.slice(0, maxLength)}...` : url;
  }
}
