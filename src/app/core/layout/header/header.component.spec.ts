import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { HeaderComponent } from './header.component';

@Component({ template: '' })
class DummyPageComponent {}

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let router: Router;

  const link = (label: string): HTMLAnchorElement => {
    const links: HTMLAnchorElement[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    return links.find(anchor => anchor.textContent?.includes(label))!;
  };

  const navigate = async (url: string): Promise<void> => {
    await router.navigateByUrl(url);
    await fixture.whenStable();
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: '', component: DummyPageComponent },
          { path: 'favorites', component: DummyPageComponent }
        ])
      ]
    });

    fixture = TestBed.createComponent(HeaderComponent);
    router = TestBed.inject(Router);
    await fixture.whenStable();
  });

  it('renders the project title', () => {
    expect(fixture.nativeElement.querySelector('.header__logo').textContent).toContain('Photo Gallery');
  });

  it('renders links to the photostream and favorites', () => {
    expect(link('Photos').getAttribute('href')).toBe('/');
    expect(link('Favorites').getAttribute('href')).toBe('/favorites');
  });

  it('highlights Photos on the photostream page', async () => {
    await navigate('/');

    expect(link('Photos').classList).toContain('active');
    expect(link('Favorites').classList).not.toContain('active');
  });

  it('highlights Favorites on the favorites page', async () => {
    await navigate('/favorites');

    expect(link('Favorites').classList).toContain('active');
    expect(link('Photos').classList).not.toContain('active');
  });
});