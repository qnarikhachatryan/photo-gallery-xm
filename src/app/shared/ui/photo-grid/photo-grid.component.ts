import { Component, input, output } from '@angular/core';

import { Photo } from '@core/models/photo.model';

import { PhotoCardComponent } from '../photo-card/photo-card.component';

// Roughly the first two rows of the grid, which are visible above the fold.
const PRIORITY_PHOTOS_COUNT = 6;

@Component({
  selector: 'app-photo-grid',
  templateUrl: './photo-grid.component.html',
  styleUrl: './photo-grid.component.scss',
  imports: [PhotoCardComponent]
})
export class PhotoGridComponent {
  readonly photos = input.required<Photo[]>();
  readonly favoriteIds = input<ReadonlySet<string>>(new Set());

  readonly photoSelect = output<string>();

  protected readonly priorityPhotosCount = PRIORITY_PHOTOS_COUNT;
}
