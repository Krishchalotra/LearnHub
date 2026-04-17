import axios from 'axios';
import { MOCK_COURSES, MOCK_ENROLLMENTS, MOCK_PROGRESS, getLessonsForCourse, paginateMock } from '../data/mockCourses';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 5000,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  log(`→ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '');
  return config;
});

// Handle 401 globally + debug logging
api.interceptors.response.use(
  (res) => {
    log(`✓ ${res.status} ${res.config.url}`);
    return res;
  },
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url;
    if (status === 401) {
      log(`✗ 401 ${url} — clearing auth`);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else {
      log(`✗ ${status ?? 'NETWORK_ERR'} ${url}`, err.message);
    }
    return Promise.reject(err);
  }
);

// ── helpers ──────────────────────────────────────────────────────────────────
const mockOk = (data) => ({ data: { success: true, message: 'OK', data } });

const DEBUG = import.meta.env.DEV;

function log(...args) {
  if (DEBUG) console.log('[LMS API]', ...args);
}

function isOffline(err) {
  // No response = network down / CORS / timeout
  if (!err.response) return true;
  if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK') return true;
  // Backend up but endpoint not found (Spring Boot not fully started or wrong port)
  const status = err.response?.status;
  if (status === 404 || status === 503 || status === 502) return true;
  return false;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
// In-memory store for mock users created during the session
const mockUserStore = [
  { id: 1, name: 'Admin User',  email: 'admin@lms.com',      password: 'password', role: 'ADMIN' },
  { id: 2, name: 'Jane Smith',  email: 'instructor@lms.com', password: 'password', role: 'INSTRUCTOR' },
  { id: 3, name: 'John Doe',    email: 'student@lms.com',    password: 'password', role: 'STUDENT' },
];
let mockIdCounter = 100;

function mockToken(user) {
  // Simple base64 mock JWT — not real, just enough for the UI
  const payload = btoa(JSON.stringify({ sub: user.email, role: user.role, exp: Date.now() + 86400000 }));
  return `mock.${payload}.signature`;
}

function mockAuthResponse(user) {
  return mockOk({
    token: mockToken(user),
    type: 'Bearer',
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

export const authAPI = {
  login: (data) =>
    api.post('/auth/login', data).catch((err) => {
      if (isOffline(err)) {
        log('⚡ Using mock login (backend offline/404)');
        const user = mockUserStore.find(
          u => u.email === data.email && u.password === data.password
        );
        if (!user) {
          const apiErr = new Error('Invalid email or password');
          apiErr.response = { data: { message: 'Invalid email or password' } };
          throw apiErr;
        }
        return mockAuthResponse(user);
      }
      throw err;
    }),

  register: (data) =>
    api.post('/auth/register', data).catch((err) => {
      if (isOffline(err)) {
        log('⚡ Using mock register (backend offline/404)');
        if (mockUserStore.find(u => u.email === data.email)) {
          const apiErr = new Error('Email already in use');
          apiErr.response = { data: { message: 'Email already in use' } };
          throw apiErr;
        }
        const newUser = {
          id: ++mockIdCounter,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role || 'STUDENT',
        };
        mockUserStore.push(newUser);
        return mockAuthResponse(newUser);
      }
      throw err;
    }),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getAllUsers: () =>
    api.get('/users').catch((err) => {
      if (isOffline(err)) return mockOk([
        { id: 1, name: 'Admin User',  email: 'admin@lms.com',      role: 'ADMIN',      createdAt: '2024-01-01T00:00:00' },
        { id: 2, name: 'Jane Smith',  email: 'instructor@lms.com', role: 'INSTRUCTOR', createdAt: '2024-01-02T00:00:00' },
        { id: 3, name: 'John Doe',    email: 'student@lms.com',    role: 'STUDENT',    createdAt: '2024-01-03T00:00:00' },
        { id: 4, name: 'Alice Brown', email: 'alice@lms.com',      role: 'STUDENT',    createdAt: '2024-01-04T00:00:00' },
        { id: 5, name: 'Bob Wilson',  email: 'bob@lms.com',        role: 'STUDENT',    createdAt: '2024-01-05T00:00:00' },
      ]);
      throw err;
    }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// ── Courses ───────────────────────────────────────────────────────────────────
export const courseAPI = {
  getAll: (params = {}) =>
    api.get('/courses', { params }).catch((err) => {
      if (isOffline(err)) {
        const { keyword = '', category = '', page = 0, size = 9 } = params;
        let filtered = [...MOCK_COURSES];
        if (keyword) filtered = filtered.filter(c =>
          c.title.toLowerCase().includes(keyword.toLowerCase()) ||
          (c.description || '').toLowerCase().includes(keyword.toLowerCase())
        );
        if (category) filtered = filtered.filter(c => c.category === category);
        return mockOk(paginateMock(filtered, Number(page), Number(size)));
      }
      throw err;
    }),

  getById: (id) =>
    api.get(`/courses/${id}`).catch((err) => {
      if (isOffline(err)) {
        const course = MOCK_COURSES.find(c => c.id === Number(id));
        if (course) return mockOk(course);
      }
      throw err;
    }),

  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),

  getMyCourses: () =>
    api.get('/courses/my').catch((err) => {
      if (isOffline(err)) return mockOk(MOCK_COURSES.slice(0, 3));
      throw err;
    }),
};

// ── Lessons ───────────────────────────────────────────────────────────────────
export const lessonAPI = {
  getByCourse: (courseId) =>
    api.get(`/courses/${courseId}/lessons`).catch((err) => {
      if (isOffline(err)) return mockOk(getLessonsForCourse(Number(courseId)));
      throw err;
    }),
  add: (courseId, data) => api.post(`/courses/${courseId}/lessons`, data),
  update: (lessonId, data) => api.put(`/lessons/${lessonId}`, data),
  delete: (lessonId) => api.delete(`/lessons/${lessonId}`),
};

// ── Enrollments ───────────────────────────────────────────────────────────────
export const enrollmentAPI = {
  enroll: (courseId) =>
    api.post(`/enroll/${courseId}`).catch((err) => {
      if (isOffline(err)) return mockOk(null);
      throw err;
    }),
  unenroll: (courseId) => api.delete(`/enroll/${courseId}`),
  getMyEnrollments: () =>
    api.get('/enroll/my').catch((err) => {
      if (isOffline(err)) return mockOk(MOCK_ENROLLMENTS);
      throw err;
    }),
  checkEnrollment: (courseId) =>
    api.get(`/enroll/check/${courseId}`).catch((err) => {
      if (isOffline(err)) return mockOk(false);
      throw err;
    }),
};

// ── Progress ──────────────────────────────────────────────────────────────────
export const progressAPI = {
  markComplete: (lessonId) =>
    api.post(`/progress/lessons/${lessonId}/complete`).catch((err) => {
      if (isOffline(err)) return mockOk(null);
      throw err;
    }),
  getCourseProgress: (courseId) =>
    api.get(`/progress/courses/${courseId}`).catch((err) => {
      if (isOffline(err)) {
        const p = MOCK_PROGRESS[Number(courseId)];
        return mockOk(p ?? { courseId, totalLessons: 5, completedLessons: 0, percentage: 0 });
      }
      throw err;
    }),
};

export default api;
