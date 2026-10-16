import { TestBed } from '@angular/core/testing';

import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
  it('renders an indeterminate spinner with an accessible label', async () => {
    const fixture = TestBed.createComponent(LoaderComponent);
    await fixture.whenStable();

    const spinner: HTMLElement = fixture.nativeElement.querySelector('mat-progress-spinner');
    expect(spinner.getAttribute('role')).toBe('progressbar');
    expect(spinner.getAttribute('mode')).toBe('indeterminate');
    expect(spinner.getAttribute('aria-label')).toBe('Loading');
  });
});