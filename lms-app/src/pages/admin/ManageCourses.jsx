import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, userAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { SkeletonCard } from '../../components/Skeleton';
import {
  PlusCircle, Pencil, Trash2, Search, BookOpen,
  Users, ChevronLeft, ChevronRight, Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDebounce } from '../../utils/useDebounce';

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const CATEGORIES = ['Fitness', 'Healthcare', 'Wellness', 'Nutrition', 'Personal Development', 'Technology', 'Backend', 'Frontend', 'DevOps', 'Architecture', 'Data Science', 'Security', 'Other'];
const levelColors = {
  BEGINNER: 'bg-green-100 text-green-700',
  INTERMEDIATE: 'bg-yellow-100 text-yellow-700',
  ADVANCED: 'bg-red-100 text-red-700',
};

function CourseFormModal({ open, onClose, initial, instructors, onSubmit, saving }) {
  const [form, setForm] = useState({
    title: '', description: '', category: '', thumbnailUrl: '',
    level: 'BEGINNER', price: '', instructorId: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        title: initial?.title || '',
        description: initial?.description || '',
        category: initial?.category || '',
        thumbnailUrl: initial?.thumbnailUrl || '',
        level: initial?.level || 'BEGINNER',
        price: initial?.price ?? '',
        instructorId: initial?.instructorId || '',
      });
    }
  }, [open, initial]);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    onSubmit({ ...form, price: form.price === '' ? null : Number(form.price) });
  };

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Edit Course' : 'Create Course'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
          <input value={form.title} onChange={set('title')} required className={inputCls} placeholder="Course title" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea value={form.description} onChange={set('description')} rows={3}
            className={`${inputCls} resize-none`} placeholder="What will students learn?" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select value={form.category} onChange={set('category')} className={inputCls}>
              <option value="">Select category...</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
            <select value={form.level} onChange={set('level')} className={inputCls}>
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
            <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')}
              className={inputCls} placeholder="0 = Free" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instructor</label>
            <select value={form.instructorId} onChange={set('instructorId')} className={inputCls}>
              <option value="">Select instructor...</option>
              {instructors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
          <input value={form.thumbnailUrl} onChange={set('thumbnailUrl')} className={inputCls} placeholder="https://..." />
        </div>

        {form.thumbnailUrl && (
          <img src={form.thumbnailUrl} alt="preview"
            className="w-full h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-600" />
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
            {saving ? 'Saving...' : initial ? 'Update Course' : 'Create Course'}
          </button>
          <button type="button" onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AdminManageCourses() {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

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

  useEffect(() => {
    userAPI.getAllUsers().then(r => {
      setInstructors(r.data.data.filter(u => u.role === 'INSTRUCTOR' || u.role === 'ADMIN'));
    });
  }, []);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (course) => { setEditing(course); setModalOpen(true); };

  const handleSubmit = async (formData) => {
    setSaving(true);
    try {
      if (editing) {
        await courseAPI.update(editing.id, formData);
        toast.success('Course updated');
      } else {
        await courseAPI.create(formData);
        toast.success('Course created');
      }
      setModalOpen(false);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await courseAPI.delete(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {loading ? '...' : `${courses.length} courses on this page`}
          </p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
          <PlusCircle size={16} /> New Course
        </button>
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
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-12 gap-2 px-5 py-3 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
          <div className="col-span-4">Course</div>
          <div className="col-span-2">Category</div>
          <div className="col-span-2">Level</div>
          <div className="col-span-1">Price</div>
          <div className="col-span-1">Students</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center">
            <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No courses found</p>
            <button onClick={openCreate} className="mt-3 text-indigo-600 text-sm font-medium hover:underline">
              Create the first course
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {courses.map(course => (
              <div key={course.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">

                {/* Course info */}
                <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                  <img
                    src={course.thumbnailUrl || `https://placehold.co/48x48/6366f1/white?text=${course.title?.[0]}`}
                    alt={course.title}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100 dark:border-gray-700"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{course.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">by {course.instructorName || '—'}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="md:col-span-2">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-full font-medium">
                    {course.category || '—'}
                  </span>
                </div>

                {/* Level */}
                <div className="md:col-span-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[course.level] || 'bg-gray-100 text-gray-600'}`}>
                    {course.level || '—'}
                  </span>
                </div>

                {/* Price */}
                <div className="md:col-span-1 text-sm font-semibold text-gray-900 dark:text-white">
                  {course.price ? `$${course.price}` : <span className="text-green-600 text-xs font-medium">Free</span>}
                </div>

                {/* Students */}
                <div className="md:col-span-1 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Users size={13} />
                  {course.enrollmentCount ?? 0}
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex items-center gap-2 md:justify-end">
                  <Link to={`/courses/${course.id}/lessons`}
                    className="text-xs px-2.5 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium">
                    Lessons
                  </Link>
                  <button onClick={() => openEdit(course)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(course.id)} disabled={deleteId === course.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
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

      {/* Modal */}
      <CourseFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        instructors={instructors}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}
