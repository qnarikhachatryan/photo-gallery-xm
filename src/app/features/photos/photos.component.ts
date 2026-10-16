import { Component, inject, OnInit } from '@angular/core';
import { MatButton } from '@angular/material/button';

import { FavoritesService } from '@core/services/favorites.service';
import { InfiniteScrollDirective } from '@shared/directives/infinite-scroll.directive';
import { LoaderComponent } from '@shared/ui/loader/loader.component';
import { PhotoGridComponent } from '@shared/ui/photo-grid/photo-grid.component';

import { PhotoStreamStore } from './photo-stream.store';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.component.html',
  styleUrl: './photos.component.scss',
  imports: [PhotoGridComponent, LoaderComponent, InfiniteScrollDirective, MatButton],
  providers: [PhotoStreamStore]
})
export class PhotosComponent implements OnInit {
  protected readonly store = inject(PhotoStreamStore);
  protected readonly favorites = inject(FavoritesService);

  ngOnInit(): void {
    this.store.loadNext();
  }
}