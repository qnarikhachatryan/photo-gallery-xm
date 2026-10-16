# Photo Gallery

A photo library built with Angular 22 and Angular Material. It shows an infinite photostream from [Lorem Picsum](https://picsum.photos) and lets you save photos to a "Favorites" library that persists across page refreshes.

## Features

- **Photos (`/`)**: an infinite, scrollable grid of photos. New pages load automatically while scrolling, with a loader below the grid. Clicking a photo adds it to or removes it from Favorites, and favorites are marked with a red heart. Failed requests show a "Try again" button.
- **Favorites (`/favorites`)**: all favorite photos, kept in `localStorage` so they survive a refresh. Clicking a photo opens the single photo page. Shows an empty state with a link to the photostream when there are no favorites.
- **Single photo (`/photos/:id`)**: the full-size photo with a "Remove from favorites" / "Add to favorites" button. Shows a "not found" state for invalid ids.
- **Header**: sticky on top, with Photos and Favorites buttons. The active view is highlighted.
- Unknown URLs redirect to `/`.

## Tech stack

- Angular 22: standalone components, zoneless change detection, signals, built-in control flow, `inject()`, lazy-loaded routes
- Angular Material 22 with a Material 3 theme (follows the OS light/dark preference)
- SCSS
- RxJS
- Vitest with jsdom for unit tests

## Getting started

Requirements: Node.js `^22.22.3`, `^24.15.0` or `>=26.0.0`.

```bash
npm install
npm start      # dev server on http://localhost:4200
npm test       # unit tests (Vitest)
npm run build  # production build into dist/photo-gallery
```

## Project structure

```
src/
├── app/
│   ├── core/                     # app-wide building blocks
│   │   ├── constants/            # API and storage constants
│   │   ├── layout/header/        # sticky header with the navigation
│   │   ├── models/               # Photo model (Picsum API response)
│   │   ├── services/             # PhotoApiService, FavoritesService, StorageService
│   │   └── utils/                # buildPhotoUrl, randomBetween
│   ├── features/                 # lazy-loaded pages
│   │   ├── photos/               # infinite photostream + PhotoStreamStore
│   │   ├── favorites/            # favorites list
│   │   └── photo-detail/         # single photo page + PhotoDetailStore
│   ├── shared/                   # reusable, presentational building blocks
│   │   ├── directives/           # InfiniteScrollDirective
│   │   └── ui/                   # photo-grid, photo-card, loader
│   ├── app.config.ts
│   └── app.routes.ts
├── environments/                 # API base URL per environment
└── styles/                       # Material 3 theme
```

Path aliases (`@core/*`, `@features/*`, `@shared/*`, `@env/*`) are used for imports between these areas.

## Implementation notes

**API.** `PhotoApiService` calls the Picsum paginated list (`/v2/list?page=&limit=`, 30 photos per page) and `/id/:id/info` for a single photo. The base URL comes from `src/environments`. Every response is delayed by a random 200–300ms with the RxJS `delay` operator to emulate a real-world API.

**Infinite scroll.** `InfiniteScrollDirective` is a small custom directive built on `IntersectionObserver`, with no third-party library. It is placed on a sentinel element below the grid and emits when the sentinel comes within `rootMargin` (200px) of the viewport. The photos page renders the sentinel only when no request is running, the last request didn't fail and more pages exist. Because of that, the directive is created again after every load, and a new observer immediately reports whether the sentinel is still visible. So on screens taller than one page, the next page loads without the user having to scroll.

**State.** State is kept in signals:

- App-wide singletons (`PhotoApiService`, `FavoritesService`, `StorageService`) use Angular 22's `@Service()` decorator.
- Page state lives in stores (`PhotoStreamStore`, `PhotoDetailStore`) provided in the page component's `providers` with `@Injectable()`. Each page gets its own instance, which is destroyed with the page. Requests are cleaned up with `takeUntilDestroyed`.
- Stores expose read-only signals; the components only read them and call store methods.

**Favorites.** `FavoritesService` keeps only the favorite photo ids and saves them to `localStorage` with an `effect`. The thumbnails are built from the id, and the single photo page loads the photo details by id. `StorageService` is the only place that accesses `localStorage`, and it returns `null` instead of throwing when the stored JSON is invalid.

**Images.** Grid cards use `NgOptimizedImage` with resized 400×300 thumbnails (`/id/:id/400/300`) instead of the full-size originals. The first six images get loading priority, and the rest are lazy loaded. The single photo page shows the original `download_url` in `fill` mode, scaled to fit between the header and the button.

**Routing.** All pages are lazy loaded with `loadComponent`. The `:id` route parameter is bound to the component input with `withComponentInputBinding()`. The photo is loaded once in `ngOnInit`, because the id doesn't change while the page is open.

**Change detection.** The app is zoneless. In Angular 22, components use `OnPush` by default, so `changeDetection` isn't set explicitly.

## Testing

Unit tests run with Vitest through the Angular `@angular/build:unit-test` builder (`npm test`). They cover:

- the services and utils
- `InfiniteScrollDirective`, with a mocked `IntersectionObserver`
- both page stores
- every component, including routing behavior through `RouterTestingHarness`

HTTP calls are tested with `HttpTestingController`, and the 200–300ms delay with fake timers.