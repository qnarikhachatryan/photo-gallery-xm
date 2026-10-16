import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { Photo } from '@core/models/photo.model';
import { FavoritesService } from '@core/services/favorites.service';

import { FavoritesComponent } from './favorites.component';

@Component({ template: '' })
class DummyPageComponent {}

const createPhoto = (id: string): Photo => ({
  id,
  author: `Author ${id}`,
  width: 100,
  height: 100,
  url: `https://unsplash.com/photos/${id}`,
  download_url: `https://picsum.photos/id/${id}/100/100`
});

describe('FavoritesComponent', () => {
  const favoritePhotos = signal<Photo[]>([]);
  const favorites = {
    favorites: favoritePhotos.asReadonly(),
    favoriteIds: computed(() => new Set(favoritePhotos().map(photo => photo.id)))
  };

  let harness: RouterTestingHarness;
  let element: HTMLElement;

  const cards = (): HTMLElement[] => Array.from(element.querySelectorAll('app-photo-card'));

  const render = async (photos: Photo[]): Promise<void> => {
    favoritePhotos.set(photos);
    harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/favorites', FavoritesComponent);
    element = harness.routeNativeElement!;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: DummyPageComponent },
          { path: 'favorites', component: FavoritesComponent },
          { path: 'photos/:id', component: DummyPageComponent }
        ]),
        { provide: FavoritesService, useValue: favorites }
      ]
    });
  });

  it('renders all favorite photos marked as favorites', async () => {
    await render([createPhoto('1'), createPhoto('2')]);

    expect(cards().length).toBe(2);
    expect(element.querySelectorAll('.photo-card__icon--active').length).toBe(2);
  });

  it('opens the single photo page when a photo is clicked', async () => {
    await render([createPhoto('1'), createPhoto('2')]);

    cards()[1].querySelector('button')!.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/photos/2');
  });

  it('shows an empty state with a link to the photostream when there are no favorites', async () => {
    await render([]);

    expect(element.querySelector('app-photo-grid')).toBeNull();
    expect(element.textContent).toContain('No favorites yet');
    expect(element.querySelector('.favorites__empty a')!.getAttribute('href')).toBe('/');
  });
});