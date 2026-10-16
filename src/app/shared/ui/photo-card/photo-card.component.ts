import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { THUMBNAIL_HEIGHT, THUMBNAIL_WIDTH } from '@core/constants/api.constants';
import { Photo } from '@core/models/photo.model';
import { buildPhotoUrl } from '@core/utils/photo-url';

@Component({
  selector: 'app-photo-card',
  templateUrl: './photo-card.component.html',
  styleUrl: './photo-card.component.scss',
  imports: [NgOptimizedImage, MatIcon]
})
export class PhotoCardComponent {
  readonly photo = input.required<Photo>();
  readonly isFavorite = input(false);
  readonly priority = input(false);

  readonly photoSelect = output<string>();

  protected readonly thumbnailUrl = computed(() => buildPhotoUrl(this.photo().id, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT));

  protected readonly thumbnailWidth = THUMBNAIL_WIDTH;
  protected readonly thumbnailHeight = THUMBNAIL_HEIGHT;
}
