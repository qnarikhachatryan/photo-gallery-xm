import { randomBetween } from './random';

describe('randomBetween', () => {
  afterEach(() => vi.restoreAllMocks());

  it('returns min when Math.random returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    expect(randomBetween(200, 300)).toBe(200);
  });

  it('returns max when Math.random returns a value close to 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9999999);
    expect(randomBetween(200, 300)).toBe(300);
  });

  it('always returns an integer within the inclusive range', () => {
    for (let i = 0; i < 1000; i++) {
      const value = randomBetween(200, 300);
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThanOrEqual(200);
      expect(value).toBeLessThanOrEqual(300);
    }
  });
});