import { Service } from '@angular/core';

@Service()
export class StorageService {
  get<T>(key: string): T | null {
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return null;
    }

    try {
      return JSON.parse(stored) as T;
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key: string): void {
    localStorage.removeItem(key);
  }
}