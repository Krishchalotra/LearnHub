import { describe, it, expect } from 'vitest';
import { MOCK_COURSES, MOCK_LESSONS, paginateMock } from '../data/mockCourses';

describe('Mock Course Data', () => {
  it('should have at least 12 courses', () => {
    expect(MOCK_COURSES.length).toBeGreaterThanOrEqual(12);
  });

  it('every course has required fields', () => {
    MOCK_COURSES.forEach(course => {
      expect(course).toHaveProperty('id');
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('category');
      expect(course).toHaveProperty('level');
      expect(course).toHaveProperty('instructorName');
      expect(course).toHaveProperty('lessonCount');
      expect(course).toHaveProperty('enrollmentCount');
    });
  });

  it('all levels are valid enum values', () => {
    const validLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    MOCK_COURSES.forEach(c => {
      expect(validLevels).toContain(c.level);
    });
  });

  it('price is null or a non-negative number', () => {
    MOCK_COURSES.forEach(c => {
      if (c.price !== null && c.price !== undefined) {
        expect(c.price).toBeGreaterThanOrEqual(0);
      }
    });
  });

  it('should have mock lessons for course 1', () => {
    const lessons = MOCK_LESSONS.filter(l => l.courseId === 1);
    expect(lessons.length).toBeGreaterThan(0);
  });

  it('lessons have required fields', () => {
    MOCK_LESSONS.forEach(l => {
      expect(l).toHaveProperty('id');
      expect(l).toHaveProperty('title');
      expect(l).toHaveProperty('orderIndex');
      expect(l).toHaveProperty('courseId');
    });
  });
});

describe('paginateMock', () => {
  const items = Array.from({ length: 25 }, (_, i) => ({ id: i + 1 }));

  it('returns correct page size', () => {
    const result = paginateMock(items, 0, 9);
    expect(result.content.length).toBe(9);
  });

  it('calculates totalPages correctly', () => {
    expect(paginateMock(items, 0, 9).totalPages).toBe(3);
    expect(paginateMock(items, 0, 10).totalPages).toBe(3);
    expect(paginateMock(items, 0, 25).totalPages).toBe(1);
  });

  it('returns correct items for page 1', () => {
    const result = paginateMock(items, 1, 9);
    expect(result.content[0].id).toBe(10);
    expect(result.content.length).toBe(9);
  });

  it('last page has remaining items', () => {
    const result = paginateMock(items, 2, 9);
    expect(result.content.length).toBe(7); // 25 - 18 = 7
  });

  it('returns empty content for out-of-range page', () => {
    const result = paginateMock(items, 99, 9);
    expect(result.content.length).toBe(0);
  });

  it('exposes totalElements', () => {
    expect(paginateMock(items, 0, 9).totalElements).toBe(25);
  });
});
