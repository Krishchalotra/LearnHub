import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CourseCard from '../components/CourseCard';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import { SkeletonCard, SkeletonRow } from '../components/Skeleton';
import { BookOpen } from 'lucide-react';

const mockCourse = {
  id: 1,
  title: 'Spring Boot Masterclass',
  description: 'Learn Spring Boot from scratch',
  category: 'Backend',
  level: 'BEGINNER',
  price: 49.99,
  thumbnailUrl: '',
  instructorName: 'Jane Smith',
  lessonCount: 42,
  enrollmentCount: 1240,
};

// ── CourseCard ────────────────────────────────────────────────────────────────
describe('CourseCard', () => {
  const renderCard = (props = {}) =>
    render(
      <MemoryRouter>
        <CourseCard course={{ ...mockCourse, ...props }} />
      </MemoryRouter>
    );

  it('renders course title', () => {
    renderCard();
    expect(screen.getByText('Spring Boot Masterclass')).toBeInTheDocument();
  });

  it('renders instructor name', () => {
    renderCard();
    expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
  });

  it('renders category', () => {
    renderCard();
    expect(screen.getByText('Backend')).toBeInTheDocument();
  });

  it('renders lesson count', () => {
    renderCard();
    expect(screen.getByText(/42 lessons/i)).toBeInTheDocument();
  });

  it('renders enrollment count', () => {
    renderCard();
    expect(screen.getByText(/1240 students/i)).toBeInTheDocument();
  });

  it('renders price', () => {
    renderCard();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
  });

  it('renders Free when price is 0', () => {
    renderCard({ price: 0 });
    expect(screen.getByText('Free')).toBeInTheDocument();
  });

  it('renders BEGINNER level badge', () => {
    renderCard();
    expect(screen.getByText('BEGINNER')).toBeInTheDocument();
  });

  it('renders View link', () => {
    renderCard();
    expect(screen.getByText(/View/i)).toBeInTheDocument();
  });

  it('renders custom actions when provided', () => {
    render(
      <MemoryRouter>
        <CourseCard course={mockCourse} actions={<button>Edit</button>} />
      </MemoryRouter>
    );
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });
});

// ── ProgressBar ───────────────────────────────────────────────────────────────
describe('ProgressBar', () => {
  it('renders with 0%', () => {
    render(<ProgressBar percentage={0} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders with 75%', () => {
    render(<ProgressBar percentage={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('renders with 100%', () => {
    render(<ProgressBar percentage={100} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps above 100 to 100', () => {
    render(<ProgressBar percentage={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('clamps below 0 to 0', () => {
    render(<ProgressBar percentage={-10} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('hides label when showLabel=false', () => {
    render(<ProgressBar percentage={50} showLabel={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });
});

// ── StatCard ──────────────────────────────────────────────────────────────────
describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard icon={BookOpen} label="Total Courses" value={42} />);
    expect(screen.getByText('Total Courses')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders trend text when provided', () => {
    render(<StatCard icon={BookOpen} label="Students" value={100} trend="+12% this month" />);
    expect(screen.getByText('+12% this month')).toBeInTheDocument();
  });
});

// ── Skeleton ──────────────────────────────────────────────────────────────────
describe('Skeleton components', () => {
  it('SkeletonCard renders without crashing', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeTruthy();
  });

  it('SkeletonRow renders without crashing', () => {
    const { container } = render(<SkeletonRow />);
    expect(container.firstChild).toBeTruthy();
  });
});
