import { environment } from '@env/environment';

import { buildPhotoUrl } from './photo-url';

describe('buildPhotoUrl', () => {
  it('builds a resized Picsum URL for the given photo id', () => {
    expect(buildPhotoUrl('42', 400, 300)).toBe(`${environment.galleryApiUrl}/id/42/400/300`);
  });

  it('encodes the photo id', () => {
    expect(buildPhotoUrl('a/b', 10, 20)).toBe(`${environment.galleryApiUrl}/id/a%2Fb/10/20`);
  });
});