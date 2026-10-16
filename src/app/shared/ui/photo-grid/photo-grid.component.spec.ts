import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Photo } from '@core/models/photo.model';

import { PhotoGridComponent } from './photo-grid.component';

const createPhoto = (id: string): Photo => ({
  id,
  author: `Author ${id}`,
  width: 100,
  height: 100,
  url: `https://unsplash.com/photos/${id}`,
  download_url: `https://picsum.photos/id/${id}/100/100`
});

describe('PhotoGridComponent', () => {
  const photos = [createPhoto('1'), createPhoto('2'), createPhoto('3')];

  let fixture: ComponentFixture<PhotoGridComponent>;
  let element: HTMLElement;

  const cards = (): HTMLElement[] => Array.from(element.querySelectorAll('app-photo-card'));

  beforeEach(async () => {
    fixture = TestBed.createComponent(PhotoGridComponent);
    fixture.componentRef.setInput('photos', photos);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('renders a card for each photo', () => {
    expect(cards().length).toBe(3);
  });

  it('renders no cards for an empty list', async () => {
    fixture.componentRef.setInput('photos', []);
    await fixture.whenStable();

    expect(cards().length).toBe(0);
  });

  it('marks favorite photos', async () => {
    fixture.componentRef.setInput('favoriteIds', new Set(['2']));
    await fixture.whenStable();

    const active = cards().map(card => card.querySelector('.photo-card__icon--active') !== null);
    expect(active).toEqual([false, true, false]);
  });

  it('gives loading priority only to the first six photos', async () => {
    const manyPhotos = Array.from({ length: 8 }, (_, index) => createPhoto(String(index)));
    fixture.componentRef.setInput('photos', manyPhotos);
    await fixture.whenStable();

    const priorities = cards().map(card => card.querySelector('img')!.getAttribute('fetchpriority') === 'high');
    expect(priorities).toEqual([true, true, true, true, true, true, false, false]);
  });

  it('emits the id of the selected photo', () => {
    const photoSelect = vi.fn();
    fixture.componentInstance.photoSelect.subscribe(photoSelect);

    cards()[1].querySelector('button')!.click();

    expect(photoSelect).toHaveBeenCalledWith('2');
  });
});