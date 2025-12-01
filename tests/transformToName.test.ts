import { describe, it, expect } from 'vitest';
import { transformToName } from '../src/lib/transformers/build-name';

describe('transformToName', () => {
  it('capitalizes names and joins', () => {
    expect(transformToName('jean', '', 'dupont')).toBe('Jean Dupont');
  });

  it('handles accents and special chars', () => {
    expect(transformToName('éloïse', '', 'märtin')).toBe('Éloïse Märtin');
  });

  it('handles hyphenated names', () => {
    expect(transformToName('jean-paul', '', 'durand')).toBe('Jean-Paul Durand');
  });

  it('keeps small particles lowercase (de)', () => {
    expect(transformToName('julien', '', 'de')).toBe('Julien de');
  });
});
