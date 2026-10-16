import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PHOTOS_PAGE_LIMIT } from '@core/constants/api.constants';
import { Photo } from '@core/models/photo.model';
import { PhotoApiService } from '@core/services/photo-api.service';

@Injectable()
export class PhotoStreamStore {
  private readonly photoApi = inject(PhotoApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly photosSignal = signal<Photo[]>([]);
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal(false);
  private readonly hasMoreSignal = signal(true);

  private page = 1;

  readonly photos = this.photosSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly hasMore = this.hasMoreSignal.asReadonly();

  loadNext(): void {
    if (this.loadingSignal() || !this.hasMoreSignal()) {
      return;
    }

    this.loadingSignal.set(true);
    this.errorSignal.set(false);

    this.photoApi
      .getPhotos(this.page, PHOTOS_PAGE_LIMIT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: photos => {
          this.page++;
          this.photosSignal.update(current => [...current, ...photos]);
          this.hasMoreSignal.set(photos.length === PHOTOS_PAGE_LIMIT);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set(true);
          this.loadingSignal.set(false);
        }
      });
  }
}
