import { Link } from 'react-router-dom';
import { Users, BookOpen, Star, Clock } from 'lucide-react';

const levelColors = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

export default function CourseCard({ course, actions }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
      <div className="relative">
        <img
          src={course.thumbnailUrl || `https://placehold.co/400x225/6366f1/white?text=${encodeURIComponent(course.title)}`}
          alt={course.title}
          className="w-full h-44 object-cover"
        />
        {course.level && (
          <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${levelColors[course.level] || 'bg-gray-100 text-gray-700'}`}>
            {course.level}
          </span>
        )}
        {course.price != null && (
          <span className="absolute top-3 right-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-bold px-2.5 py-1 rounded-full shadow">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-1">{course.category}</p>
        <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-snug mb-2 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1">{course.description}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span className="flex items-center gap-1"><BookOpen size={13} />{course.lessonCount} lessons</span>
          <span className="flex items-center gap-1"><Users size={13} />{course.enrollmentCount} students</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">by {course.instructorName}</span>
          <div className="flex gap-2">
            {actions ? actions :
              <Link to={`/courses/${course.id}`}
                className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors">
                View →
              </Link>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
