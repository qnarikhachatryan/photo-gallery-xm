import { computed, effect, inject, Service, signal } from '@angular/core';

import { FAVORITES_STORAGE_KEY } from '../constants/storage.constants';
import { StorageService } from './storage.service';

@Service()
export class FavoritesService {
  private readonly storage = inject(StorageService);
  private readonly favoriteIdsSignal = signal<string[]>(this.storage.get<string[]>(FAVORITES_STORAGE_KEY) ?? []);

  readonly favoriteIds = this.favoriteIdsSignal.asReadonly();
  readonly favoriteIdSet = computed(() => new Set(this.favoriteIdsSignal()));

  constructor() {
    effect(() => this.storage.set(FAVORITES_STORAGE_KEY, this.favoriteIdsSignal()));
  }

  isFavorite(id: string): boolean {
    return this.favoriteIdSet().has(id);
  }

  add(id: string): void {
    if (!this.isFavorite(id)) {
      this.favoriteIdsSignal.update(ids => [...ids, id]);
    }
  }

  remove(id: string): void {
    this.favoriteIdsSignal.update(ids => ids.filter(favoriteId => favoriteId !== id));
  }

  toggle(id: string): void {
    if (this.isFavorite(id)) {
      this.remove(id);
    } else {
      this.add(id);
    }
  }
}