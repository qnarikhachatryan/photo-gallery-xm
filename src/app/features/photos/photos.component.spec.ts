import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { PHOTOS_PAGE_LIMIT } from '@core/constants/api.constants';
import { Photo } from '@core/models/photo.model';
import { FavoritesService } from '@core/services/favorites.service';
import { PhotoApiService } from '@core/services/photo-api.service';

import { PhotosComponent } from './photos.component';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(private readonly callback: (entries: Partial<IntersectionObserverEntry>[]) => void) {
    MockIntersectionObserver.instances.push(this);
  }

  static latest(): MockIntersectionObserver {
    return MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1];
  }

  trigger(isIntersecting: boolean): void {
    this.callback([{ isIntersecting }]);
  }
}

const createPhoto = (id: string): Photo => ({
  id,
  author: `Author ${id}`,
  width: 100,
  height: 100,
  url: `https://unsplash.com/photos/${id}`,
  download_url: `https://picsum.photos/id/${id}/100/100`
});

const createPage = (page: number, size = PHOTOS_PAGE_LIMIT): Photo[] =>
  Array.from({ length: size }, (_, index) => createPhoto(`${page}-${index}`));

describe('PhotosComponent', () => {
  let fixture: ComponentFixture<PhotosComponent>;
  let element: HTMLElement;
  let responses: Subject<Photo[]>[];

  const photoApi = { getPhotos: vi.fn() };
  const favorites = { favoriteIds: signal(new Set<string>()), toggle: vi.fn() };

  const grid = (): HTMLElement | null => element.querySelector('app-photo-grid');
  const cards = (): HTMLElement[] => Array.from(element.querySelectorAll('app-photo-card'));
  const loader = (): HTMLElement | null => element.querySelector('app-loader');
  const sentinel = (): HTMLElement | null => element.querySelector('[appInfiniteScroll]');

  const respond = async (photos: Photo[]): Promise<void> => {
    const response = responses.shift()!;
    response.next(photos);
    response.complete();
    await fixture.whenStable();
  };

  const fail = async (): Promise<void> => {
    responses.shift()!.error(new Error('Network error'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    responses = [];
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    vi.clearAllMocks();
    favorites.favoriteIds.set(new Set());
    photoApi.getPhotos.mockImplementation(() => {
      const response = new Subject<Photo[]>();
      responses.push(response);
      return response;
    });

    TestBed.configureTestingModule({
      providers: [
        { provide: PhotoApiService, useValue: photoApi },
        { provide: FavoritesService, useValue: favorites }
      ]
    });

    fixture = TestBed.createComponent(PhotosComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('requests the first page on init and shows only the loader', () => {
    expect(photoApi.getPhotos).toHaveBeenCalledWith(1, PHOTOS_PAGE_LIMIT);
    expect(loader()).not.toBeNull();
    expect(grid()).toBeNull();
    expect(sentinel()).toBeNull();
  });

  it('renders the loaded photos and starts watching for more', async () => {
    await respond(createPage(1));

    expect(cards().length).toBe(PHOTOS_PAGE_LIMIT);
    expect(loader()).toBeNull();
    expect(sentinel()).not.toBeNull();
  });

  it('loads the next page when the end of the list is reached', async () => {
    await respond(createPage(1));

    MockIntersectionObserver.latest().trigger(true);
    await fixture.whenStable();

    expect(photoApi.getPhotos).toHaveBeenLastCalledWith(2, PHOTOS_PAGE_LIMIT);
    expect(loader()).not.toBeNull();

    await respond(createPage(2));

    expect(cards().length).toBe(PHOTOS_PAGE_LIMIT * 2);
  });

  it('toggles a clicked photo in favorites', async () => {
    const page = createPage(1);
    await respond(page);

    cards()[0].querySelector('button')!.click();

    expect(favorites.toggle).toHaveBeenCalledWith(page[0]);
  });

  it('marks favorite photos in the grid', async () => {
    const page = createPage(1);
    favorites.favoriteIds.set(new Set([page[1].id]));
    await respond(page);

    const active = cards().slice(0, 3).map(card => card.querySelector('.photo-card__icon--active') !== null);
    expect(active).toEqual([false, true, false]);
  });

  it('shows an error with a retry button that requests the same page again', async () => {
    await fail();

    expect(element.textContent).toContain('Could not load photos.');
    expect(sentinel()).toBeNull();

    element.querySelector<HTMLButtonElement>('.photos__error button')!.click();
    await fixture.whenStable();

    expect(photoApi.getPhotos).toHaveBeenCalledTimes(2);
    expect(photoApi.getPhotos).toHaveBeenLastCalledWith(1, PHOTOS_PAGE_LIMIT);
  });

  it('stops watching for more photos after the last page', async () => {
    await respond(createPage(1, 5));

    expect(cards().length).toBe(5);
    expect(sentinel()).toBeNull();
    expect(element.textContent).not.toContain('No photos available');
  });

  it('shows a fallback text instead of the grid when there are no photos', async () => {
    await respond([]);

    expect(grid()).toBeNull();
    expect(element.textContent).toContain('No photos available');
  });
});