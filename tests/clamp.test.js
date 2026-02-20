const { clamp } = require('../scripts/utils');

describe('clamp function', () => {
  test('should return the value itself if it is within the range', () => {
    expect(clamp(0, 5, 10)).toBe(5);
    expect(clamp(-10, 0, 10)).toBe(0);
    expect(clamp(1.5, 2.5, 3.5)).toBe(2.5);
  });

  test('should return the minimum value if the value is below the range', () => {
    expect(clamp(0, -5, 10)).toBe(0);
    expect(clamp(10, 5, 20)).toBe(10);
    expect(clamp(-5, -10, 5)).toBe(-5);
  });

  test('should return the maximum value if the value is above the range', () => {
    expect(clamp(0, 15, 10)).toBe(10);
    expect(clamp(10, 25, 20)).toBe(20);
    expect(clamp(-10, 10, 5)).toBe(5);
  });

  test('should return the minimum value if the value is equal to the minimum', () => {
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(-5, -5, 5)).toBe(-5);
  });

  test('should return the maximum value if the value is equal to the maximum', () => {
    expect(clamp(0, 10, 10)).toBe(10);
    expect(clamp(-5, 5, 5)).toBe(5);
  });

  test('should handle negative numbers correctly', () => {
    expect(clamp(-10, -15, -5)).toBe(-10);
    expect(clamp(-10, -7, -5)).toBe(-7);
    expect(clamp(-10, -2, -5)).toBe(-5);
  });

  test('should handle cases where min and max are the same', () => {
    expect(clamp(5, 10, 5)).toBe(5);
    expect(clamp(5, 2, 5)).toBe(5);
    expect(clamp(5, 5, 5)).toBe(5);
  });

  test('should handle floating point numbers', () => {
    expect(clamp(0.1, 0.05, 0.9)).toBe(0.1);
    expect(clamp(0.1, 0.5, 0.9)).toBe(0.5);
    expect(clamp(0.1, 1.0, 0.9)).toBe(0.9);
  });
});
