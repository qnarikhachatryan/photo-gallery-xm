import { computed, effect, inject, Service, signal } from '@angular/core';

import { FAVORITES_STORAGE_KEY } from '../constants/storage.constants';
import { Photo } from '../models/photo.model';
import { StorageService } from './storage.service';

@Service()
export class FavoritesService {
  private readonly storage = inject(StorageService);
  private readonly favoritesSignal = signal<Photo[]>(this.storage.get<Photo[]>(FAVORITES_STORAGE_KEY) ?? []);

  readonly favorites = this.favoritesSignal.asReadonly();
  readonly count = computed(() => this.favoritesSignal().length);
  readonly favoriteIds = computed(() => new Set(this.favoritesSignal().map(photo => photo.id)));

  constructor() {
    effect(() => this.storage.set(FAVORITES_STORAGE_KEY, this.favoritesSignal()));
  }

  isFavorite(id: string): boolean {
    return this.favoriteIds().has(id);
  }

  add(photo: Photo): void {
    if (!this.isFavorite(photo.id)) {
      this.favoritesSignal.update(favorites => [...favorites, photo]);
    }
  }

  remove(id: string): void {
    this.favoritesSignal.update(favorites => favorites.filter(photo => photo.id !== id));
  }

  toggle(photo: Photo): void {
    if (this.isFavorite(photo.id)) {
      this.remove(photo.id);
    } else {
      this.add(photo);
    }
  }
}
