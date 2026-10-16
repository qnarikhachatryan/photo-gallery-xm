import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '@env/environment';

import { PHOTOS_PAGE_LIMIT } from '../constants/api.constants';
import { Photo } from '../models/photo.model';
import { PhotoApiService } from './photo-api.service';

const PHOTO: Photo = {
  id: '0',
  author: 'Alejandro Escamilla',
  width: 5616,
  height: 3744,
  url: 'https://unsplash.com/photos/yC-Yzbqy7PY',
  download_url: 'https://picsum.photos/id/0/5616/3744'
};

describe('PhotoApiService', () => {
  let service: PhotoApiService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(PhotoApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('getPhotos', () => {
    it('requests the given page with the default limit', () => {
      service.getPhotos(2).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${environment.galleryApiUrl}/v2/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('page')).toBe('2');
      expect(req.request.params.get('limit')).toBe(String(PHOTOS_PAGE_LIMIT));
      req.flush([]);
    });

    it('requests a custom limit', () => {
      service.getPhotos(1, 100).subscribe();

      const req = httpTesting.expectOne(r => r.url === `${environment.galleryApiUrl}/v2/list`);
      expect(req.request.params.get('limit')).toBe('100');
      req.flush([]);
    });

    it('emits the response no earlier than the minimum delay', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0);
      const next = vi.fn();
      service.getPhotos(1).subscribe(next);

      httpTesting.expectOne(r => r.url.endsWith('/v2/list')).flush([PHOTO]);

      vi.advanceTimersByTime(199);
      expect(next).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(next).toHaveBeenCalledWith([PHOTO]);
    });

    it('emits the response no later than the maximum delay', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.9999999);
      const next = vi.fn();
      service.getPhotos(1).subscribe(next);

      httpTesting.expectOne(r => r.url.endsWith('/v2/list')).flush([PHOTO]);

      vi.advanceTimersByTime(299);
      expect(next).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(next).toHaveBeenCalledWith([PHOTO]);
    });
  });

  describe('getPhoto', () => {
    it('requests a single photo info by id and emits it after the delay', () => {
      const next = vi.fn();
      service.getPhoto('0').subscribe(next);

      const req = httpTesting.expectOne(`${environment.galleryApiUrl}/id/0/info`);
      expect(req.request.method).toBe('GET');
      req.flush(PHOTO);

      vi.advanceTimersByTime(300);
      expect(next).toHaveBeenCalledWith(PHOTO);
    });
  });
});