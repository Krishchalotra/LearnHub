import { useEffect, useState } from 'react';
import { courseAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import CourseCard from '../../components/CourseCard';
import { BookOpen, Users, PlusCircle, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseAPI.getMyCourses()
      .then(r => setCourses(Array.isArray(r.data.data) ? r.data.data : []))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const totalStudents = courses.reduce((s, c) => s + (c.enrollmentCount || 0), 0);
  const totalLessons  = courses.reduce((s, c) => s + (c.lessonCount    || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your courses and students</p>
        </div>
        <Link to="/instructor/courses"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          <PlusCircle size={16} /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard icon={BookOpen}   label="My Courses"      value={courses.length} color="indigo" />
        <StatCard icon={Users}      label="Total Students"  value={totalStudents}  color="green"  />
        <StatCard icon={TrendingUp} label="Total Lessons"   value={totalLessons}   color="purple" />
      </div>

      {/* Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Your Courses</h2>
          <Link to="/instructor/courses" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            Manage all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
                <div className="h-44 bg-gray-200 dark:bg-gray-700" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 mb-3">No courses yet. Create your first one!</p>
            <Link to="/instructor/courses"
              className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
              Create Course
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(c => (
              <CourseCard key={c.id} course={c}
                actions={
                  <Link to={`/instructor/courses`}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
                    Manage →
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { to: '/instructor/courses', label: 'Manage Courses', emoji: '📚' },
          { to: '/courses',            label: 'Browse All',     emoji: '🔍' },
          { to: '/profile',            label: 'Edit Profile',   emoji: '👤' },
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
