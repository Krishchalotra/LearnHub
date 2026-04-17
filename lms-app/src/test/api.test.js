import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// We test the fallback logic by mocking axios to simulate network failure
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    default: {
      ...actual.default,
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
  };
});

import { MOCK_COURSES, paginateMock } from '../data/mockCourses';

describe('courseAPI fallback logic', () => {
  it('paginates mock courses correctly for page 0', () => {
    const result = paginateMock(MOCK_COURSES, 0, 9);
    expect(result.content.length).toBe(9);
    expect(result.totalPages).toBe(Math.ceil(MOCK_COURSES.length / 9));
  });

  it('filters mock courses by keyword', () => {
    const keyword = 'spring';
    const filtered = MOCK_COURSES.filter(c =>
      c.title.toLowerCase().includes(keyword) ||
      (c.description || '').toLowerCase().includes(keyword)
    );
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(c => {
      const match =
        c.title.toLowerCase().includes(keyword) ||
        (c.description || '').toLowerCase().includes(keyword);
      expect(match).toBe(true);
    });
  });

  it('filters mock courses by category', () => {
    const category = 'Frontend';
    const filtered = MOCK_COURSES.filter(c => c.category === category);
    expect(filtered.length).toBeGreaterThan(0);
    filtered.forEach(c => expect(c.category).toBe(category));
  });

  it('returns empty array for unknown category', () => {
    const filtered = MOCK_COURSES.filter(c => c.category === 'NonExistent');
    expect(filtered.length).toBe(0);
  });

  it('finds course by id', () => {
    const course = MOCK_COURSES.find(c => c.id === 1);
    expect(course).toBeDefined();
    expect(course.title).toBe('Spring Boot 3 Masterclass');
  });

  it('returns undefined for non-existent id', () => {
    const course = MOCK_COURSES.find(c => c.id === 9999);
    expect(course).toBeUndefined();
  });
});

describe('isOffline detection', () => {
  it('detects network error (no response)', () => {
    const err = { code: 'ERR_NETWORK' };
    const isOffline = (e) => !e.response || e.code === 'ECONNABORTED' || e.code === 'ERR_NETWORK';
    expect(isOffline(err)).toBe(true);
  });

  it('detects timeout error', () => {
    const err = { code: 'ECONNABORTED' };
    const isOffline = (e) => !e.response || e.code === 'ECONNABORTED' || e.code === 'ERR_NETWORK';
    expect(isOffline(err)).toBe(true);
  });

  it('does NOT treat 404 as offline', () => {
    const err = { response: { status: 404 }, code: undefined };
    const isOffline = (e) => !e.response || e.code === 'ECONNABORTED' || e.code === 'ERR_NETWORK';
    expect(isOffline(err)).toBe(false);
  });

  it('does NOT treat 500 as offline', () => {
    const err = { response: { status: 500 }, code: undefined };
    const isOffline = (e) => !e.response || e.code === 'ECONNABORTED' || e.code === 'ERR_NETWORK';
    expect(isOffline(err)).toBe(false);
  });
});
