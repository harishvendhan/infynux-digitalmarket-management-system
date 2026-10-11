import { describe, it, expect } from 'vitest';
import { isValidHttpUrl, detectPlatform } from './urls';

describe('URL Validation & Platform Detection Tests (D10)', () => {
  it('validates http and https URLs correctly', () => {
    expect(isValidHttpUrl('https://instagram.com/reel/12345')).toBe(true);
    expect(isValidHttpUrl('http://youtube.com/watch?v=123')).toBe(true);
    expect(isValidHttpUrl('not-a-url')).toBe(false);
    expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    expect(isValidHttpUrl('')).toBe(false);
    expect(isValidHttpUrl(null)).toBe(false);
  });

  it('detects platform icons accurately', () => {
    expect(detectPlatform('https://www.instagram.com/reel/abc/')).toBe('instagram');
    expect(detectPlatform('https://youtu.be/xyz')).toBe('youtube');
    expect(detectPlatform('https://www.facebook.com/watch/?v=123')).toBe('facebook');
    expect(detectPlatform('https://linkedin.com/posts/xyz')).toBe('linkedin');
    expect(detectPlatform('https://www.tiktok.com/@user/video/123')).toBe('tiktok');
    expect(detectPlatform('https://example.com/blog/my-post')).toBe('generic');
  });
});
