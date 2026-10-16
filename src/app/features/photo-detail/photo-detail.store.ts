import { computed, DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Photo } from '@core/models/photo.model';
import { FavoritesService } from '@core/services/favorites.service';
import { PhotoApiService } from '@core/services/photo-api.service';

@Injectable()
export class PhotoDetailStore {
  private readonly photoApi = inject(PhotoApiService);
  private readonly favorites = inject(FavoritesService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly photoSignal = signal<Photo | undefined>(undefined);
  private readonly loadingSignal = signal(false);

  readonly photo = this.photoSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly isFavorite = computed(() => {
    const photo = this.photoSignal();
    return !!photo && this.favorites.favoriteIds().has(photo.id);
  });

  load(id: string): void {
    this.loadingSignal.set(true);

    this.photoApi
      .getPhoto(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: photo => {
          this.photoSignal.set(photo);
          this.loadingSignal.set(false);
        },
        error: () => this.loadingSignal.set(false)
      });
  }

  toggleFavorite(): void {
    const photo = this.photoSignal();
    if (photo) {
      this.favorites.toggle(photo);
    }
  }
}