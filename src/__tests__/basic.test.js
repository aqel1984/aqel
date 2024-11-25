// src/__tests__/basic.test.js
import { describe, it, expect } from '@jest/globals';

describe('Simple Test Suite', () => {
  it('should pass a simple test', () => {
    expect(2 + 2).toBe(4);
  });
});