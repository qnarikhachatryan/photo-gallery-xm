import { TestBed } from '@angular/core/testing';

import { FAVORITES_STORAGE_KEY } from '../constants/storage.constants';
import { FavoritesService } from './favorites.service';
import { StorageService } from './storage.service';

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
    it('reads favorite ids by the favorites storage key', () => {
      createService();

      expect(storage.get).toHaveBeenCalledWith(FAVORITES_STORAGE_KEY);
    });

    it('starts empty when nothing is stored', () => {
      expect(createService().favoriteIds()).toEqual([]);
    });

    it('restores previously stored favorite ids', () => {
      storage.get.mockReturnValue(['1', '2']);

      const service = createService();

      expect(service.favoriteIds()).toEqual(['1', '2']);
      expect(service.isFavorite('2')).toBe(true);
    });
  });

  describe('add', () => {
    it('adds a photo id to favorites', () => {
      const service = createService();

      service.add('1');

      expect(service.favoriteIds()).toEqual(['1']);
      expect(service.favoriteIdSet().has('1')).toBe(true);
      expect(service.isFavorite('1')).toBe(true);
    });

    it('ignores an id that is already a favorite', () => {
      const service = createService();
      service.add('1');

      service.add('1');

      expect(service.favoriteIds()).toEqual(['1']);
    });
  });

  describe('remove', () => {
    it('removes a photo id from favorites', () => {
      const service = createService();
      service.add('1');
      service.add('2');

      service.remove('1');

      expect(service.favoriteIds()).toEqual(['2']);
      expect(service.isFavorite('1')).toBe(false);
    });

    it('does nothing when the id is not a favorite', () => {
      const service = createService();
      service.add('1');

      service.remove('missing');

      expect(service.favoriteIds()).toEqual(['1']);
    });
  });

  describe('toggle', () => {
    it('adds an id that is not a favorite', () => {
      const service = createService();

      service.toggle('1');

      expect(service.favoriteIds()).toEqual(['1']);
    });

    it('removes an id that is already a favorite', () => {
      const service = createService();
      service.add('1');

      service.toggle('1');

      expect(service.favoriteIds()).toEqual([]);
    });
  });

  describe('persistence', () => {
    it('writes only the favorite ids to storage after they change', () => {
      const service = createService();

      service.add('1');
      TestBed.tick();
      expect(storage.set).toHaveBeenLastCalledWith(FAVORITES_STORAGE_KEY, ['1']);

      service.remove('1');
      TestBed.tick();
      expect(storage.set).toHaveBeenLastCalledWith(FAVORITES_STORAGE_KEY, []);
    });
  });
});