import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI, progressAPI } from '../../services/api';
import ProgressBar from '../../components/ProgressBar';
import { BookOpen, CheckCircle, Clock, TrendingUp, Award, Play } from 'lucide-react';

const levelColors = {
  BEGINNER:     'bg-green-100  text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED:     'bg-red-100    text-red-700',
};

function ProgressRing({ percentage, size = 64 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percentage / 100) * circ;
  const color = percentage === 100 ? '#22c55e' : percentage > 50 ? '#6366f1' : '#f59e0b';

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        className="rotate-90" style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', fontSize: 13, fontWeight: 700, fill: color }}>
        {percentage}%
      </text>
    </svg>
  );
}

export default function MyLearning() {
  const [enrollments, setEnrollments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | in-progress | completed

  useEffect(() => {
    enrollmentAPI.getMyEnrollments()
      .then(async (r) => {
        const courses = Array.isArray(r.data.data) ? r.data.data : [];
        setEnrollments(courses);
        const pairs = await Promise.all(
          courses.map(c =>
            progressAPI.getCourseProgress(c.id)
              .then(p => [c.id, p.data.data])
              .catch(() => [c.id, { percentage: 0, completedLessons: 0, totalLessons: c.lessonCount ?? 0 }])
          )
        );
        setProgressMap(Object.fromEntries(pairs));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed  = enrollments.filter(c => (progressMap[c.id]?.percentage ?? 0) === 100);
  const inProgress = enrollments.filter(c => {
    const p = progressMap[c.id]?.percentage ?? 0;
    return p > 0 && p < 100;
  });
  const notStarted = enrollments.filter(c => (progressMap[c.id]?.percentage ?? 0) === 0);

  const totalLessons   = Object.values(progressMap).reduce((s, p) => s + (p?.totalLessons ?? 0), 0);
  const doneLessons    = Object.values(progressMap).reduce((s, p) => s + (p?.completedLessons ?? 0), 0);
  const overallPct     = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  const filtered = filter === 'completed'  ? completed
                 : filter === 'in-progress' ? inProgress
                 : enrollments;

  if (loading) return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0,1,2].map(i => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Learning</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your progress across all enrolled courses</p>
      </div>

      {/* Overall stats */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ProgressRing percentage={overallPct} size={80} />
          <div className="flex-1 text-center sm:text-left">
            <p className="text-indigo-100 text-sm mb-1">Overall Learning Progress</p>
            <p className="text-3xl font-bold">{overallPct}% Complete</p>
            <p className="text-indigo-200 text-sm mt-1">
              {doneLessons} of {totalLessons} lessons completed across {enrollments.length} courses
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Enrolled',    value: enrollments.length, icon: BookOpen },
              { label: 'In Progress', value: inProgress.length,  icon: TrendingUp },
              { label: 'Completed',   value: completed.length,   icon: Award },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <Icon size={18} className="mx-auto mb-1 text-indigo-200" />
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-indigo-200">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all',         label: `All (${enrollments.length})` },
          { key: 'in-progress', label: `In Progress (${inProgress.length})` },
          { key: 'completed',   label: `Completed (${completed.length})` },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
              ${filter === tab.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Course cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 mb-3">
            {filter === 'completed' ? 'No completed courses yet. Keep going!' :
             filter === 'in-progress' ? 'No courses in progress.' :
             'You haven\'t enrolled in any courses yet.'}
          </p>
          <Link to="/courses"
            className="inline-block px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors">
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => {
            const prog = progressMap[course.id] ?? { percentage: 0, completedLessons: 0, totalLessons: course.lessonCount ?? 0 };
            const pct  = prog.percentage ?? 0;
            const done = pct === 100;

            return (
              <div key={course.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={course.thumbnailUrl || `https://placehold.co/400x180/6366f1/white?text=${encodeURIComponent(course.title?.[0] ?? 'C')}`}
                    alt={course.title}
                    className="w-full h-36 object-cover"
                    onError={e => { e.target.src = 'https://placehold.co/400x180/6366f1/white?text=C'; }}
                  />
                  {done && (
                    <div className="absolute inset-0 bg-green-600/80 flex items-center justify-center">
                      <div className="text-center text-white">
                        <CheckCircle size={32} className="mx-auto mb-1" />
                        <p className="text-sm font-semibold">Completed!</p>
                      </div>
                    </div>
                  )}
                  {course.level && (
                    <span className={`absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full ${levelColors[course.level] ?? 'bg-gray-100 text-gray-600'}`}>
                      {course.level}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">{course.category}</p>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">by {course.instructorName}</p>

                  {/* Progress */}
                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle size={12} className="text-green-500" />
                        {prog.completedLessons}/{prog.totalLessons} lessons
                      </span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{pct}%</span>
                    </div>
                    <ProgressBar
                      percentage={pct}
                      showLabel={false}
                      size="md"
                      color={done ? 'green' : pct > 50 ? 'indigo' : 'yellow'}
                    />
                  </div>

                  {/* CTA */}
                  <Link to={`/courses/${course.id}`}
                    className={`mt-3 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-colors
                      ${done
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>
                    {done ? (
                      <><CheckCircle size={14} /> Review Course</>
                    ) : pct > 0 ? (
                      <><Play size={14} /> Continue</>
                    ) : (
                      <><Play size={14} /> Start Learning</>
                    )}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Not started section */}
      {notStarted.length > 0 && filter === 'all' && (
        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" /> Not Started Yet
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {notStarted.map(course => (
              <Link key={course.id} to={`/courses/${course.id}`}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3 hover:shadow-sm hover:border-indigo-200 transition-all">
                <img
                  src={course.thumbnailUrl || 'https://placehold.co/48x48/6366f1/white?text=C'}
                  alt={course.title}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  onError={e => { e.target.src = 'https://placehold.co/48x48/6366f1/white?text=C'; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{course.lessonCount} lessons · Not started</p>
                </div>
                <Play size={16} className="text-indigo-500 flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
