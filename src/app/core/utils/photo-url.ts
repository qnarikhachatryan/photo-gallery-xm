import { environment } from '@env/environment';

// `download_url` points to the full-resolution original (up to ~5000px), so we request a resized copy instead.
export function buildPhotoUrl(id: string, width: number, height: number): string {
  return `${environment.galleryApiUrl}/id/${encodeURIComponent(id)}/${width}/${height}`;
}