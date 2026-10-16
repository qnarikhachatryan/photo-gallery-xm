import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Photo } from '@core/models/photo.model';
import { environment } from '@env/environment';

import { PhotoCardComponent } from './photo-card.component';

const PHOTO: Photo = {
  id: '7',
  author: 'Alejandro Escamilla',
  width: 5616,
  height: 3744,
  url: 'https://unsplash.com/photos/7',
  download_url: 'https://picsum.photos/id/7/5616/3744'
};

describe('PhotoCardComponent', () => {
  let fixture: ComponentFixture<PhotoCardComponent>;
  let element: HTMLElement;

  const image = (): HTMLImageElement => element.querySelector('img')!;
  const icon = (): HTMLElement => element.querySelector('.photo-card__icon')!;

  const render = async (inputs: Partial<{ isFavorite: boolean; priority: boolean }> = {}): Promise<void> => {
    fixture = TestBed.createComponent(PhotoCardComponent);
    fixture.componentRef.setInput('photo', PHOTO);
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    element = fixture.nativeElement;
    await fixture.whenStable();
  };

  it('renders a resized thumbnail instead of the full-size image', async () => {
    await render();

    expect(image().getAttribute('src')).toBe(`${environment.galleryApiUrl}/id/7/400/300`);
    expect(image().getAttribute('alt')).toBe('Alejandro Escamilla');
  });

  it('lazy loads the image by default', async () => {
    await render();

    expect(image().getAttribute('loading')).toBe('lazy');
    expect(image().getAttribute('fetchpriority')).not.toBe('high');
  });

  it('loads a priority image eagerly with high fetch priority', async () => {
    await render({ priority: true });

    expect(image().getAttribute('loading')).toBe('eager');
    expect(image().getAttribute('fetchpriority')).toBe('high');
  });

  it('emits the photo id when clicked', async () => {
    await render();
    const photoSelect = vi.fn();
    fixture.componentInstance.photoSelect.subscribe(photoSelect);

    element.querySelector('button')!.click();

    expect(photoSelect).toHaveBeenCalledWith('7');
  });

  it('does not mark the icon as active for a photo that is not a favorite', async () => {
    await render();

    expect(icon().classList).not.toContain('photo-card__icon--active');
  });

  it('marks the icon as active for a favorite photo', async () => {
    await render({ isFavorite: true });

    expect(icon().classList).toContain('photo-card__icon--active');
  });
});