import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseAPI, lessonAPI, enrollmentAPI, progressAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import { BookOpen, Clock, Users, CheckCircle, Circle, Play, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CourseDetail() {
  const { id } = useParams();
  const { user, isStudent } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    Promise.all([
      courseAPI.getById(id),
      lessonAPI.getByCourse(id).catch(() => ({ data: { data: [] } })),
      isStudent ? enrollmentAPI.checkEnrollment(id).catch(() => ({ data: { data: false } })) : Promise.resolve({ data: { data: false } }),
      isStudent ? progressAPI.getCourseProgress(id).catch(() => ({ data: { data: null } })) : Promise.resolve({ data: { data: null } }),
    ]).then(([c, l, e, p]) => {
      setCourse(c.data.data);
      setLessons(l.data.data);
      setEnrolled(e.data.data);
      setProgress(p.data.data);
      if (l.data.data.length > 0) setActiveLesson(l.data.data[0]);
    }).finally(() => setLoading(false));
  }, [id, isStudent]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      await enrollmentAPI.enroll(id);
      setEnrolled(true);
      toast.success('Enrolled successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const handleMarkComplete = async (lesson) => {
    try {
      await progressAPI.markComplete(lesson.id);
      setLessons(ls => ls.map(l => l.id === lesson.id ? { ...l, completed: true } : l));
      const p = await progressAPI.getCourseProgress(id);
      setProgress(p.data.data);
      toast.success('Lesson completed!');
    } catch {
      toast.error('Failed to mark lesson');
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
    </div>
  );

  if (!course) return <p className="text-center text-gray-500 py-20">Course not found</p>;

  const canWatch = enrolled || !isStudent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <img src={course.thumbnailUrl || `https://placehold.co/400x225/6366f1/white?text=${encodeURIComponent(course.title)}`}
            alt={course.title} className="w-full lg:w-72 h-44 object-cover rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-full">{course.category}</span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 mb-2">{course.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
              <span className="flex items-center gap-1"><BookOpen size={14} />{lessons.length} lessons</span>
              <span className="flex items-center gap-1"><Users size={14} />{course.enrollmentCount} students</span>
              <span className="flex items-center gap-1"><Clock size={14} />{course.level}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">by <span className="font-medium text-gray-700 dark:text-gray-200">{course.instructorName}</span></p>

            {isStudent && !enrolled && (
              <button onClick={handleEnroll} disabled={enrolling}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm">
                {enrolling ? 'Enrolling...' : `Enroll ${course.price ? `— $${course.price}` : '— Free'}`}
              </button>
            )}
            {enrolled && progress && (
              <div className="max-w-xs">
                <ProgressBar percentage={progress.percentage} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress.completedLessons}/{progress.totalLessons} lessons completed</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lesson viewer */}
      {lessons.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video */}
          <div className="lg:col-span-2 space-y-4">
            {activeLesson && canWatch ? (
              <div className="bg-black rounded-2xl overflow-hidden aspect-video">
                <iframe src={activeLesson.videoUrl} title={activeLesson.title}
                  className="w-full h-full" allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
              </div>
            ) : (
              <div className="bg-gray-900 rounded-2xl aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <Lock size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm opacity-70">Enroll to watch lessons</p>
                </div>
              </div>
            )}
            {activeLesson && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
                <h2 className="font-semibold text-gray-900 dark:text-white text-lg">{activeLesson.title}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{activeLesson.content}</p>
                {canWatch && isStudent && !activeLesson.completed && (
                  <button onClick={() => handleMarkComplete(activeLesson)}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors">
                    <CheckCircle size={16} /> Mark as Completed
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Lesson list */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Course Content</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-y-auto scrollbar-hide">
              {lessons.map((lesson, idx) => (
                <button key={lesson.id} onClick={() => canWatch && setActiveLesson(lesson)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                    ${activeLesson?.id === lesson.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}
                    ${!canWatch ? 'cursor-not-allowed opacity-60' : ''}`}>
                  <div className="flex-shrink-0">
                    {lesson.completed
                      ? <CheckCircle size={18} className="text-green-500" />
                      : canWatch
                        ? <Play size={18} className="text-indigo-500" />
                        : <Lock size={18} className="text-gray-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{lesson.title}</p>
                    {lesson.duration && <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration} min</p>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
