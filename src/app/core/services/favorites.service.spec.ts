import { TestBed } from '@angular/core/testing';

import { FAVORITES_STORAGE_KEY } from '../constants/storage.constants';
import { Photo } from '../models/photo.model';
import { FavoritesService } from './favorites.service';
import { StorageService } from './storage.service';

const createPhoto = (id: string): Photo => ({
  id,
  author: `Author ${id}`,
  width: 100,
  height: 100,
  url: `https://unsplash.com/photos/${id}`,
  download_url: `https://picsum.photos/id/${id}/100/100`
});

describe('FavoritesService', () => {
  const storage = {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn()
  };

  const createService = (): FavoritesService => {
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storage }]
    });
    return TestBed.inject(FavoritesService);
  };

  beforeEach(() => {
    vi.resetAllMocks();
    storage.get.mockReturnValue(null);
  });

  describe('restoring from storage', () => {
    it('reads favorites by the favorites storage key', () => {
      createService();

      expect(storage.get).toHaveBeenCalledWith(FAVORITES_STORAGE_KEY);
    });

    it('starts empty when nothing is stored', () => {
      const service = createService();

      expect(service.favorites()).toEqual([]);
      expect(service.count()).toBe(0);
    });

    it('restores previously stored favorites', () => {
      const photos = [createPhoto('1'), createPhoto('2')];
      storage.get.mockReturnValue(photos);

      const service = createService();

      expect(service.favorites()).toEqual(photos);
      expect(service.isFavorite('2')).toBe(true);
    });
  });

  describe('add', () => {
    it('adds a photo to favorites', () => {
      const service = createService();
      const photo = createPhoto('1');

      expect(service.add(photo)).toBe(true);
      expect(service.favorites()).toEqual([photo]);
      expect(service.count()).toBe(1);
      expect(service.isFavorite('1')).toBe(true);
    });

    it('ignores a photo that is already a favorite', () => {
      const service = createService();
      service.add(createPhoto('1'));

      expect(service.add(createPhoto('1'))).toBe(false);
      expect(service.count()).toBe(1);
    });
  });

  describe('remove', () => {
    it('removes a photo from favorites by id', () => {
      const service = createService();
      service.add(createPhoto('1'));
      service.add(createPhoto('2'));

      service.remove('1');

      expect(service.favorites().map(photo => photo.id)).toEqual(['2']);
      expect(service.isFavorite('1')).toBe(false);
    });

    it('does nothing when the photo is not a favorite', () => {
      const service = createService();
      service.add(createPhoto('1'));

      service.remove('missing');

      expect(service.count()).toBe(1);
    });
  });

  describe('persistence', () => {
    it('writes favorites to storage after they change', () => {
      const service = createService();
      const photo = createPhoto('1');

      service.add(photo);
      TestBed.tick();
      expect(storage.set).toHaveBeenLastCalledWith(FAVORITES_STORAGE_KEY, [photo]);

      service.remove('1');
      TestBed.tick();
      expect(storage.set).toHaveBeenLastCalledWith(FAVORITES_STORAGE_KEY, []);
    });
  });
});