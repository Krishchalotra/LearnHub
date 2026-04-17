import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { MOCK_COURSES, paginateMock } from '../data/mockCourses';

// Mock the entire api module
vi.mock('../services/api', () => ({
  courseAPI: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getMyCourses: vi.fn(),
  },
  userAPI: {
    getAllUsers: vi.fn(),
    getMe: vi.fn(),
    updateProfile: vi.fn(),
    deleteUser: vi.fn(),
  },
  enrollmentAPI: {
    getMyEnrollments: vi.fn(),
    checkEnrollment: vi.fn(),
    enroll: vi.fn(),
    unenroll: vi.fn(),
  },
  progressAPI: {
    getCourseProgress: vi.fn(),
    markComplete: vi.fn(),
  },
  authAPI: {
    login: vi.fn(),
    register: vi.fn(),
  },
  default: {},
}));

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@test.com', role: 'STUDENT' },
    isStudent: true,
    isInstructor: false,
    isAdmin: false,
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    loading: false,
  }),
  AuthProvider: ({ children }) => children,
}));

import { courseAPI } from '../services/api';
import Courses from '../pages/Courses';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';

// ── Courses Page ──────────────────────────────────────────────────────────────
describe('Courses Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    courseAPI.getAll.mockResolvedValue({
      data: { data: paginateMock(MOCK_COURSES, 0, 9) }
    });
  });

  const renderCourses = () =>
    render(<MemoryRouter><Courses /></MemoryRouter>);

  it('shows loading skeletons initially', () => {
    renderCourses();
    // Skeletons are rendered as animated divs
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders course cards after loading', async () => {
    renderCourses();
    await waitFor(() => {
      expect(screen.getByText('Spring Boot 3 Masterclass')).toBeInTheDocument();
    });
  });

  it('renders multiple courses', async () => {
    renderCourses();
    await waitFor(() => {
      expect(screen.getByText('React 19 & TypeScript Complete Guide')).toBeInTheDocument();
    });
  });

  it('renders search input', () => {
    renderCourses();
    expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument();
  });

  it('renders category filter', () => {
    renderCourses();
    expect(screen.getByText('All Categories')).toBeInTheDocument();
  });

  it('calls courseAPI.getAll on mount', async () => {
    renderCourses();
    await waitFor(() => {
      expect(courseAPI.getAll).toHaveBeenCalledTimes(1);
    });
  });

  it('shows "No courses found" when API returns empty', async () => {
    courseAPI.getAll.mockResolvedValue({
      data: { data: paginateMock([], 0, 9) }
    });
    renderCourses();
    await waitFor(() => {
      expect(screen.getByText(/No courses found/i)).toBeInTheDocument();
    });
  });

  it('calls API with search keyword after typing', async () => {
    const user = userEvent.setup();
    renderCourses();
    await waitFor(() => screen.getByPlaceholderText('Search courses...'));
    const input = screen.getByPlaceholderText('Search courses...');
    await user.type(input, 'spring');
    await waitFor(() => {
      expect(courseAPI.getAll).toHaveBeenCalledWith(
        expect.objectContaining({ keyword: 'spring' })
      );
    }, { timeout: 1000 });
  });
});

// ── CourseCard interactions ───────────────────────────────────────────────────
describe('CourseCard interactions', () => {
  it('navigates to course detail on View click', () => {
    render(
      <MemoryRouter>
        <CourseCard course={MOCK_COURSES[0]} />
      </MemoryRouter>
    );
    const link = screen.getByText(/View/i).closest('a');
    expect(link).toHaveAttribute('href', `/courses/${MOCK_COURSES[0].id}`);
  });

  it('renders ADVANCED badge with correct text', () => {
    render(
      <MemoryRouter>
        <CourseCard course={{ ...MOCK_COURSES[0], level: 'ADVANCED' }} />
      </MemoryRouter>
    );
    expect(screen.getByText('ADVANCED')).toBeInTheDocument();
  });
});

// ── ProgressBar ───────────────────────────────────────────────────────────────
describe('ProgressBar rendering', () => {
  it('renders progress label', () => {
    render(<ProgressBar percentage={60} />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('bar width style matches percentage', () => {
    const { container } = render(<ProgressBar percentage={40} showLabel={false} />);
    const bar = container.querySelector('[style]');
    expect(bar?.style.width).toBe('40%');
  });
});
