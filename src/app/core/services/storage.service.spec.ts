import { TestBed } from '@angular/core/testing';

import { StorageService } from './storage.service';

const createMemoryStorage = (): Storage => {
  const items = new Map<string, string>();

  return {
    get length() {
      return items.size;
    },
    clear: () => items.clear(),
    getItem: key => items.get(key) ?? null,
    key: index => [...items.keys()][index] ?? null,
    removeItem: key => {
      items.delete(key);
    },
    setItem: (key, value) => {
      items.set(key, value);
    }
  };
};

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    // jsdom in the Angular unit-test builder doesn't expose `localStorage`.
    vi.stubGlobal('localStorage', createMemoryStorage());
    service = TestBed.inject(StorageService);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('stores a value as JSON', () => {
    service.set('key', { id: '1' });

    expect(localStorage.getItem('key')).toBe('{"id":"1"}');
  });

  it('returns a parsed stored value', () => {
    localStorage.setItem('key', '[1,2,3]');

    expect(service.get<number[]>('key')).toEqual([1, 2, 3]);
  });

  it('returns null when nothing is stored', () => {
    expect(service.get('missing')).toBeNull();
  });

  it('returns null when the stored value is not valid JSON', () => {
    localStorage.setItem('key', '{not json');

    expect(service.get('key')).toBeNull();
  });

  it('removes a stored value', () => {
    service.set('key', 'value');

    service.remove('key');

    expect(localStorage.getItem('key')).toBeNull();
  });
});
