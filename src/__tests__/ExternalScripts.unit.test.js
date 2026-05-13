import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('external script loading', () => {
  it.each(['index.html', 'public/index.html'])(
    'loads Google Maps with the async loading parameter in %s',
    (filePath) => {
      const source = readFileSync(filePath, 'utf8');

      expect(source).toContain('maps.googleapis.com/maps/api/js');
      expect(source).toContain('loading=async');
    },
  );
});
