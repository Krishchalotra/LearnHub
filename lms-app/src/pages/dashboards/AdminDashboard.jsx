import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, courseAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import { Users, BookOpen, GraduationCap, TrendingUp, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const roleColors = {
  ADMIN:      'bg-red-100    text-red-700',
  INSTRUCTOR: 'bg-purple-100 text-purple-700',
  STUDENT:    'bg-green-100  text-green-700',
};

const levelColors = {
  BEGINNER:     'bg-green-100  text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED:     'bg-red-100    text-red-700',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users,   setUsers]   = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userAPI.getAllUsers(),
      courseAPI.getAll({ size: 6 }),
    ])
      .then(([u, c]) => {
        setUsers(Array.isArray(u.data.data) ? u.data.data : []);
        setCourses(c.data.data?.content ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const students    = users.filter(u => u.role === 'STUDENT').length;
  const instructors = users.filter(u => u.role === 'INSTRUCTOR').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard 🛡️
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Logged in as <span className="font-medium text-gray-700 dark:text-gray-200">{user?.name}</span> · {user?.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}      label="Total Users"   value={loading ? '…' : users.length}   color="indigo" />
        <StatCard icon={GraduationCap} label="Students"   value={loading ? '…' : students}       color="green"  />
        <StatCard icon={TrendingUp} label="Instructors"   value={loading ? '…' : instructors}    color="purple" />
        <StatCard icon={BookOpen}   label="Total Courses" value={loading ? '…' : courses.length} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Users</h2>
            <Link to="/admin/users"
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {[0,1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400">No users found</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.slice(0, 6).map(u => (
                <div key={u.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex-shrink-0">
                    {u.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${roleColors[u.role] ?? 'bg-gray-100 text-gray-600'}`}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recent Courses</h2>
            <Link to="/admin/courses"
              className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
              Manage all <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {[0,1,2,3].map(i => (
                <div key={i} className="flex items-center gap-3 px-5 py-3 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                    <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="py-10 text-center">
              <BookOpen size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-400 mb-2">No courses yet</p>
              <Link to="/admin/courses" className="text-xs text-indigo-600 hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {courses.slice(0, 6).map(c => (
                <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <img
                    src={c.thumbnailUrl || `https://placehold.co/40x40/6366f1/white?text=${encodeURIComponent(c.title?.[0] ?? 'C')}`}
                    alt={c.title}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src = 'https://placehold.co/40x40/6366f1/white?text=C'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">by {c.instructorName ?? '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[c.level] ?? 'bg-gray-100 text-gray-600'}`}>
                      {c.level ?? '—'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{c.enrollmentCount ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { to: '/admin/users',   label: 'Manage Users',   emoji: '👥' },
          { to: '/admin/courses', label: 'Manage Courses', emoji: '📚' },
          { to: '/courses',       label: 'Browse Courses', emoji: '🔍' },
          { to: '/profile',       label: 'My Profile',     emoji: '👤' },
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
