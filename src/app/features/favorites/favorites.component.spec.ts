import { Component, computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { FavoritesService } from '@core/services/favorites.service';
import { environment } from '@env/environment';

import { FavoritesComponent } from './favorites.component';

@Component({ template: '' })
class DummyPageComponent {}

describe('FavoritesComponent', () => {
  const favoriteIds = signal<string[]>([]);
  const favorites = {
    favoriteIds: favoriteIds.asReadonly(),
    favoriteIdSet: computed(() => new Set(favoriteIds()))
  };

  let harness: RouterTestingHarness;
  let element: HTMLElement;

  const cards = (): HTMLElement[] => Array.from(element.querySelectorAll('app-photo-card'));

  const render = async (ids: string[]): Promise<void> => {
    favoriteIds.set(ids);
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
    await render(['1', '2']);

    expect(cards().length).toBe(2);
    expect(element.querySelectorAll('.photo-card__icon--active').length).toBe(2);
  });

  it('builds the thumbnails from the stored ids', async () => {
    await render(['1', '2']);

    const sources = cards().map(card => card.querySelector('img')!.getAttribute('src'));
    expect(sources).toEqual([`${environment.galleryApiUrl}/id/1/400/300`, `${environment.galleryApiUrl}/id/2/400/300`]);
  });

  it('opens the single photo page when a photo is clicked', async () => {
    await render(['1', '2']);

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