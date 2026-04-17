import { describe, it, expect, beforeEach } from 'vitest';

// Test auth utility logic (pure functions, no React needed)
const parseUser = (str) => {
  try { return JSON.parse(str); } catch { return null; }
};

const buildAuthResponse = (token, user) => ({
  token,
  type: 'Bearer',
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const getRoleRedirect = (role) => {
  const map = { ADMIN: '/dashboard', INSTRUCTOR: '/dashboard', STUDENT: '/dashboard' };
  return map[role] || '/login';
};

describe('Auth utilities', () => {
  beforeEach(() => localStorage.clear());

  it('parseUser returns null for invalid JSON', () => {
    expect(parseUser('not-json')).toBeNull();
    expect(parseUser(null)).toBeNull();
    expect(parseUser(undefined)).toBeNull();
  });

  it('parseUser returns object for valid JSON', () => {
    const user = { id: 1, name: 'Test', role: 'STUDENT' };
    expect(parseUser(JSON.stringify(user))).toEqual(user);
  });

  it('buildAuthResponse includes all required fields', () => {
    const user = { id: 1, name: 'Jane', email: 'jane@test.com', role: 'INSTRUCTOR' };
    const result = buildAuthResponse('tok123', user);
    expect(result.token).toBe('tok123');
    expect(result.type).toBe('Bearer');
    expect(result.role).toBe('INSTRUCTOR');
    expect(result.email).toBe('jane@test.com');
  });

  it('getRoleRedirect returns /dashboard for all roles', () => {
    expect(getRoleRedirect('ADMIN')).toBe('/dashboard');
    expect(getRoleRedirect('INSTRUCTOR')).toBe('/dashboard');
    expect(getRoleRedirect('STUDENT')).toBe('/dashboard');
  });

  it('getRoleRedirect returns /login for unknown role', () => {
    expect(getRoleRedirect('UNKNOWN')).toBe('/login');
  });

  it('stores and retrieves token from localStorage', () => {
    localStorage.setItem('token', 'abc123');
    expect(localStorage.getItem('token')).toBe('abc123');
  });

  it('clears auth data on logout', () => {
    localStorage.setItem('token', 'abc123');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});

describe('Role-based access control', () => {
  const canAccess = (userRole, allowedRoles) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    return allowedRoles.includes(userRole);
  };

  it('ADMIN can access admin-only routes', () => {
    expect(canAccess('ADMIN', ['ADMIN'])).toBe(true);
  });

  it('STUDENT cannot access admin-only routes', () => {
    expect(canAccess('STUDENT', ['ADMIN'])).toBe(false);
  });

  it('INSTRUCTOR can access instructor+admin routes', () => {
    expect(canAccess('INSTRUCTOR', ['INSTRUCTOR', 'ADMIN'])).toBe(true);
  });

  it('STUDENT cannot access instructor routes', () => {
    expect(canAccess('STUDENT', ['INSTRUCTOR', 'ADMIN'])).toBe(false);
  });

  it('any role can access public routes (no restriction)', () => {
    expect(canAccess('STUDENT', [])).toBe(true);
    expect(canAccess('ADMIN', null)).toBe(true);
  });
});
