import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfiniteScrollDirective } from './infinite-scroll.directive';

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];

  readonly observe = vi.fn();
  readonly disconnect = vi.fn();

  constructor(
    private readonly callback: (entries: Partial<IntersectionObserverEntry>[]) => void,
    readonly options: IntersectionObserverInit
  ) {
    MockIntersectionObserver.instances.push(this);
  }

  static latest(): MockIntersectionObserver {
    return MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1];
  }

  trigger(isIntersecting: boolean): void {
    this.callback([{ isIntersecting }]);
  }
}

@Component({
  template: `
    @if (visible()) {
      <div appInfiniteScroll [rootMargin]="rootMargin()" (scrolled)="scrolled()"></div>
    }
  `,
  imports: [InfiniteScrollDirective]
})
class HostComponent {
  readonly visible = signal(true);
  readonly rootMargin = signal(200);
  readonly scrolled = vi.fn();
}

describe('InfiniteScrollDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const sentinel = (): HTMLElement => fixture.nativeElement.querySelector('[appInfiniteScroll]');

  beforeEach(async () => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('observes the host element with the default root margin', () => {
    const observer = MockIntersectionObserver.latest();

    expect(observer.observe).toHaveBeenCalledWith(sentinel());
    expect(observer.options.rootMargin).toBe('200px');
  });

  it('uses a custom root margin', async () => {
    MockIntersectionObserver.instances = [];
    fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.rootMargin.set(500);
    await fixture.whenStable();

    expect(MockIntersectionObserver.latest().options.rootMargin).toBe('500px');
  });

  it('emits when the element enters the viewport', () => {
    MockIntersectionObserver.latest().trigger(true);

    expect(host.scrolled).toHaveBeenCalledTimes(1);
  });

  it('does not emit when the element is outside the viewport', () => {
    MockIntersectionObserver.latest().trigger(false);

    expect(host.scrolled).not.toHaveBeenCalled();
  });

  it('disconnects the observer when destroyed', async () => {
    const observer = MockIntersectionObserver.latest();

    host.visible.set(false);
    await fixture.whenStable();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('starts a new observer when rendered again, so a still visible element emits again', async () => {
    host.visible.set(false);
    await fixture.whenStable();
    host.visible.set(true);
    await fixture.whenStable();

    const observer = MockIntersectionObserver.latest();
    expect(MockIntersectionObserver.instances.length).toBe(2);
    expect(observer.observe).toHaveBeenCalledWith(sentinel());

    observer.trigger(true);
    expect(host.scrolled).toHaveBeenCalledTimes(1);
  });
});