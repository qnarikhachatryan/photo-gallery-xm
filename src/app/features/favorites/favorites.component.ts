import { Component, inject } from '@angular/core';
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

  protected openPhoto(photo: Photo): void {
    this.router.navigate(['/photos', photo.id]);
  }
}