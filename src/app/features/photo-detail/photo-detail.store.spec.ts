import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { Photo } from '@core/models/photo.model';
import { FavoritesService } from '@core/services/favorites.service';
import { PhotoApiService } from '@core/services/photo-api.service';

import { PhotoDetailStore } from './photo-detail.store';

const PHOTO: Photo = {
  id: '7',
  author: 'Alejandro Escamilla',
  width: 5616,
  height: 3744,
  url: 'https://unsplash.com/photos/7',
  download_url: 'https://picsum.photos/id/7/5616/3744'
};

describe('PhotoDetailStore', () => {
  const favoriteIds = signal<string[]>([]);
  const favorites = {
    isFavorite: (id: string) => favoriteIds().includes(id),
    toggle: vi.fn()
  };
  const photoApi = { getPhoto: vi.fn() };

  let store: PhotoDetailStore;
  let response: Subject<Photo>;

  beforeEach(() => {
    vi.clearAllMocks();
    favoriteIds.set([]);
    response = new Subject<Photo>();
    photoApi.getPhoto.mockReturnValue(response);

    TestBed.configureTestingModule({
      providers: [
        PhotoDetailStore,
        { provide: FavoritesService, useValue: favorites },
        { provide: PhotoApiService, useValue: photoApi }
      ]
    });
    store = TestBed.inject(PhotoDetailStore);
  });

  it('starts empty and idle', () => {
    expect(store.photo()).toBeUndefined();
    expect(store.loading()).toBe(false);
    expect(store.isFavorite()).toBe(false);
  });

  it('loads the photo by id', () => {
    store.load('7');

    expect(photoApi.getPhoto).toHaveBeenCalledWith('7');
    expect(store.loading()).toBe(true);

    response.next(PHOTO);

    expect(store.photo()).toEqual(PHOTO);
    expect(store.loading()).toBe(false);
  });

  it('stops loading when the request fails', () => {
    store.load('unknown');

    response.error(new Error('Not found'));

    expect(store.photo()).toBeUndefined();
    expect(store.loading()).toBe(false);
  });

  it('tells whether the loaded photo is a favorite', () => {
    store.load('7');
    response.next(PHOTO);

    expect(store.isFavorite()).toBe(false);

    favoriteIds.set(['7']);

    expect(store.isFavorite()).toBe(true);
  });

  it('toggles the loaded photo in favorites', () => {
    store.load('7');
    response.next(PHOTO);

    store.toggleFavorite();

    expect(favorites.toggle).toHaveBeenCalledWith('7');
  });

  it('does nothing on toggle when no photo is loaded', () => {
    store.toggleFavorite();

    expect(favorites.toggle).not.toHaveBeenCalled();
  });
});