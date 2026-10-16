import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { PHOTOS_PAGE_LIMIT } from '@core/constants/api.constants';
import { Photo } from '@core/models/photo.model';
import { PhotoApiService } from '@core/services/photo-api.service';

import { PhotoStreamStore } from './photo-stream.store';

const createPhoto = (id: string): Photo => ({
  id,
  author: `Author ${id}`,
  width: 100,
  height: 100,
  url: `https://unsplash.com/photos/${id}`,
  download_url: `https://picsum.photos/id/${id}/100/100`
});

const createPage = (page: number, size = PHOTOS_PAGE_LIMIT): Photo[] =>
  Array.from({ length: size }, (_, index) => createPhoto(`${page}-${index}`));

describe('PhotoStreamStore', () => {
  let store: PhotoStreamStore;
  let responses: Subject<Photo[]>[];
  const photoApi = { getPhotos: vi.fn() };

  const respond = (photos: Photo[]): void => {
    const response = responses.shift()!;
    response.next(photos);
    response.complete();
  };

  beforeEach(() => {
    responses = [];
    photoApi.getPhotos.mockReset().mockImplementation(() => {
      const response = new Subject<Photo[]>();
      responses.push(response);
      return response;
    });

    TestBed.configureTestingModule({
      providers: [PhotoStreamStore, { provide: PhotoApiService, useValue: photoApi }]
    });
    store = TestBed.inject(PhotoStreamStore);
  });

  it('starts empty and idle', () => {
    expect(store.photos()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBe(false);
    expect(store.hasMore()).toBe(true);
  });

  it('loads the first page', () => {
    store.loadNext();

    expect(photoApi.getPhotos).toHaveBeenCalledWith(1, PHOTOS_PAGE_LIMIT);
    expect(store.loading()).toBe(true);

    const page = createPage(1);
    respond(page);

    expect(store.photos()).toEqual(page);
    expect(store.loading()).toBe(false);
  });

  it('appends the next pages', () => {
    const firstPage = createPage(1);
    const secondPage = createPage(2);

    store.loadNext();
    respond(firstPage);
    store.loadNext();
    respond(secondPage);

    expect(photoApi.getPhotos).toHaveBeenLastCalledWith(2, PHOTOS_PAGE_LIMIT);
    expect(store.photos()).toEqual([...firstPage, ...secondPage]);
  });

  it('ignores loading requests while a page is loading', () => {
    store.loadNext();
    store.loadNext();

    expect(photoApi.getPhotos).toHaveBeenCalledTimes(1);
  });

  it('sets the error state when loading fails and retries the same page', () => {
    store.loadNext();
    responses.shift()!.error(new Error('Network error'));

    expect(store.error()).toBe(true);
    expect(store.loading()).toBe(false);

    store.loadNext();

    expect(store.error()).toBe(false);
    expect(photoApi.getPhotos).toHaveBeenLastCalledWith(1, PHOTOS_PAGE_LIMIT);
  });

  it('stops loading when a page is shorter than the limit', () => {
    store.loadNext();
    respond(createPage(1, 5));

    expect(store.hasMore()).toBe(false);

    store.loadNext();

    expect(photoApi.getPhotos).toHaveBeenCalledTimes(1);
  });
});