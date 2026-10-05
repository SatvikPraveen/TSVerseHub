// File: tests/concepts/module-augmentation.test.ts

import { describe, it, expect } from 'vitest';
import '@/concepts/namespaces-modules/module-augmentation';

describe('String.prototype.stripHtml', () => {
  it('removes ordinary tags and keeps text', () => {
    expect('<p>Hello <b>world</b></p>'.stripHtml()).toBe('Hello world');
  });

  it('does not reassemble tags from nested fragments', () => {
    const out = '<scr<script>ipt>alert(1)</scr</script>ipt>'.stripHtml();
    expect(out).not.toMatch(/<|>/);
    expect(out.toLowerCase()).not.toContain('<script');
  });

  it('drops unterminated tags and stray brackets', () => {
    expect('a < b <img src=x onerror=alert(1)'.stripHtml()).not.toMatch(/[<>]/);
  });
});
