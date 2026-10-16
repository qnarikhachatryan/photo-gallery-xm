import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import { Photo } from '@core/models/photo.model';
import { FavoritesService } from '@core/services/favorites.service';
import { PhotoApiService } from '@core/services/photo-api.service';

import { PhotoDetailComponent } from './photo-detail.component';

const PHOTO: Photo = {
  id: '7',
  author: 'Alejandro Escamilla',
  width: 5616,
  height: 3744,
  url: 'https://unsplash.com/photos/7',
  download_url: 'https://picsum.photos/id/7/5616/3744'
};

describe('PhotoDetailComponent', () => {
  const favoriteIds = signal<string[]>([]);
  const favorites = {
    isFavorite: (id: string) => favoriteIds().includes(id),
    toggle: vi.fn((id: string) =>
      favoriteIds.update(ids => (ids.includes(id) ? ids.filter(favoriteId => favoriteId !== id) : [...ids, id]))
    )
  };
  const photoApi = { getPhoto: vi.fn() };

  let fixture: ComponentFixture<PhotoDetailComponent>;
  let element: HTMLElement;

  const image = (): HTMLImageElement | null => element.querySelector('.photo-detail__image');
  const button = (): HTMLButtonElement | null => element.querySelector('button');

  const render = async (id: string): Promise<void> => {
    fixture = TestBed.createComponent(PhotoDetailComponent);
    fixture.componentRef.setInput('id', id);
    element = fixture.nativeElement;
    await fixture.whenStable();
  };

  beforeEach(() => {
    vi.clearAllMocks();
    favoriteIds.set([]);
    photoApi.getPhoto.mockReturnValue(of(PHOTO));

    TestBed.configureTestingModule({
      providers: [
        { provide: FavoritesService, useValue: favorites },
        { provide: PhotoApiService, useValue: photoApi }
      ]
    });
  });

  it('loads the photo by the route id', async () => {
    await render('7');

    expect(photoApi.getPhoto).toHaveBeenCalledWith('7');
  });

  it('shows the original photo filling the image area', async () => {
    await render('7');

    expect(image()!.getAttribute('src')).toBe(PHOTO.download_url);
    expect(image()!.getAttribute('alt')).toBe('Photo by Alejandro Escamilla');
    expect(image()!.style.position).toBe('absolute');
  });

  it('keeps the button below the image area', async () => {
    await render('7');

    const wrapper = element.querySelector('.photo-detail')!;
    expect(wrapper.children[0].classList).toContain('photo-detail__image-wrapper');
    expect(wrapper.children[1].querySelector('button')).not.toBeNull();
  });

  it('shows the loader while the photo is loading', async () => {
    photoApi.getPhoto.mockReturnValue(new Subject<Photo>());

    await render('7');

    expect(element.querySelector('app-loader')).not.toBeNull();
    expect(image()).toBeNull();
  });

  it('offers to remove a favorite photo from favorites', async () => {
    favoriteIds.set(['7']);

    await render('7');

    expect(button()!.textContent).toContain('Remove from favorites');
    expect(button()!.querySelector('mat-icon')!.textContent?.trim()).toBe('heart_broken');
  });

  it('offers to add a photo that is not a favorite to favorites', async () => {
    await render('7');

    expect(button()!.textContent).toContain('Add to favorites');
    expect(button()!.querySelector('mat-icon')!.textContent?.trim()).toBe('favorite');
  });

  it('toggles the photo in favorites and updates the button', async () => {
    favoriteIds.set(['7']);
    await render('7');

    button()!.click();
    await fixture.whenStable();

    expect(favorites.toggle).toHaveBeenCalledWith('7');
    expect(image()).not.toBeNull();
    expect(button()!.textContent).toContain('Add to favorites');

    button()!.click();
    await fixture.whenStable();

    expect(button()!.textContent).toContain('Remove from favorites');
  });

  it('shows a not found message when the photo cannot be loaded', async () => {
    photoApi.getPhoto.mockReturnValue(throwError(() => new Error('Not found')));

    await render('unknown');

    const notFound = element.querySelector('.photo-detail__not-found')!;
    expect(notFound.querySelector('mat-icon')!.textContent?.trim()).toBe('sentiment_dissatisfied');
    expect(notFound.textContent).toContain('We could not find this image');
    expect(element.querySelector('app-loader')).toBeNull();
    expect(image()).toBeNull();
    expect(button()).toBeNull();
  });

  it('does not show the not found message while loading or after a successful load', async () => {
    photoApi.getPhoto.mockReturnValue(new Subject<Photo>());
    await render('7');

    expect(element.querySelector('.photo-detail__not-found')).toBeNull();

    photoApi.getPhoto.mockReturnValue(of(PHOTO));
    await render('7');

    expect(element.querySelector('.photo-detail__not-found')).toBeNull();
  });
});