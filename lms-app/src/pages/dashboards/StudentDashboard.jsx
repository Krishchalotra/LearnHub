import { useEffect, useState } from 'react';
import { enrollmentAPI, progressAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import { BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentAPI.getMyEnrollments()
      .then(async (r) => {
        const courses = Array.isArray(r.data.data) ? r.data.data : [];
        setEnrollments(courses);
        const pairs = await Promise.all(
          courses.map(c =>
            progressAPI.getCourseProgress(c.id)
              .then(p => [c.id, p.data.data])
              .catch(() => [c.id, { percentage: 0, completedLessons: 0, totalLessons: 0 }])
          )
        );
        setProgressMap(Object.fromEntries(pairs));
      })
      .catch(() => setEnrollments([]))
      .finally(() => setLoading(false));
  }, []);

  const completed = Object.values(progressMap).filter(p => p?.percentage === 100).length;
  const inProgress = enrollments.length - completed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your learning progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={BookOpen}      label="Enrolled"    value={enrollments.length} color="indigo" />
        <StatCard icon={GraduationCap} label="Completed"   value={completed}          color="green"  />
        <StatCard icon={TrendingUp}    label="In Progress" value={inProgress}         color="yellow" />
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Continue Learning</h2>
          <Link to="/courses" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Browse more →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[0, 1].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex gap-4 animate-pulse">
                <div className="w-20 h-16 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">You haven't enrolled in any courses yet.</p>
            <Link to="/courses"
              className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {enrollments.map(course => {
              const prog = progressMap[course.id];
              return (
                <Link key={course.id} to={`/courses/${course.id}`}
                  className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all flex gap-4">
                  <img
                    src={course.thumbnailUrl || `https://placehold.co/80x60/6366f1/white?text=C`}
                    alt={course.title}
                    className="w-20 h-16 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src = 'https://placehold.co/80x60/6366f1/white?text=C'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{course.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{course.lessonCount ?? 0} lessons</p>
                    <ProgressBar percentage={prog?.percentage ?? 0} size="sm" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: '/courses',            label: 'Browse Courses',  emoji: '📚' },
          { to: '/student/enrollments',label: 'My Enrollments',  emoji: '🎓' },
          { to: '/profile',            label: 'Edit Profile',    emoji: '👤' },
        ].map(item => (
          <Link key={item.to} to={item.to}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all text-center">
            <div className="text-2xl mb-1">{item.emoji}</div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
