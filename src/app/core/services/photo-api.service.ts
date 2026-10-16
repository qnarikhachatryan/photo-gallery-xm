import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { delay, Observable } from 'rxjs';

import { environment } from '@env/environment';

import { API_DELAY_MAX_MS, API_DELAY_MIN_MS, PHOTOS_PAGE_LIMIT } from '../constants/api.constants';
import { Photo } from '../models/photo.model';
import { randomBetween } from '../utils/random';

@Service()
export class PhotoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.galleryApiUrl;

  getPhotos(page: number, limit = PHOTOS_PAGE_LIMIT): Observable<Photo[]> {
    const params = new HttpParams().set('page', page).set('limit', limit);

    return this.http
      .get<Photo[]>(`${this.baseUrl}/v2/list`, { params })
      .pipe(delay(randomBetween(API_DELAY_MIN_MS, API_DELAY_MAX_MS)));
  }

  getPhoto(id: string): Observable<Photo> {
    return this.http
      .get<Photo>(`${this.baseUrl}/id/${encodeURIComponent(id)}/info`)
      .pipe(delay(randomBetween(API_DELAY_MIN_MS, API_DELAY_MAX_MS)));
  }
}