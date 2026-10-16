import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';

import { Photo } from '@core/models/photo.model';
import { FavoritesService } from '@core/services/favorites.service';
import { PhotoGridComponent } from '@shared/ui/photo-grid/photo-grid.component';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrl: './favorites.component.scss',
  imports: [PhotoGridComponent, RouterLink, MatButton]
})
export class FavoritesComponent {
  private readonly router = inject(Router);

  protected readonly favorites = inject(FavoritesService);
  protected readonly photos = computed(() => this.favorites.favoriteIds().map(id => ({
    id,
    author: '',
    width: 0,
    height: 0,
    url: '',
    download_url: ''
  }) satisfies Photo));

  protected openPhoto(id: string): void {
    this.router.navigate(['/photos', id]);
  }
}
