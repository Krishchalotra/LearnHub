import { useEffect, useState, useCallback } from 'react';
import { courseAPI } from '../services/api';
import CourseCard from '../components/CourseCard';
import { SkeletonCard } from '../components/Skeleton';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDebounce } from '../utils/useDebounce';

const CATEGORIES = ['', 'Fitness', 'Healthcare', 'Wellness', 'Nutrition', 'Personal Development', 'Technology', 'Backend', 'Frontend', 'DevOps'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const debouncedSearch = useDebounce(search, 400);

  const fetchCourses = useCallback(() => {
    setLoading(true);
    courseAPI.getAll({ keyword: debouncedSearch, category, page, size: 9 })
      .then(r => {
        const data = r.data.data;
        setCourses(data.content || []);
        setTotalPages(data.totalPages || 0);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearch, category, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);
  useEffect(() => { setPage(0); }, [debouncedSearch, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Browse Courses</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Discover something new to learn</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="Search courses..." />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm appearance-none">
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No courses found</p>
          <p className="text-gray-400 text-sm mt-1">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
            className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600 dark:text-gray-400">Page {page + 1} of {totalPages}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
            className="p-2 rounded-xl border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
