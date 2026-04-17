import { useEffect, useState } from 'react';
import { courseAPI } from '../../services/api';
import CourseCard from '../../components/CourseCard';
import Modal from '../../components/Modal';
import CourseForm from '../../components/CourseForm';
import { SkeletonCard } from '../../components/Skeleton';
import { PlusCircle, Pencil, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ManageCourses() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCourses = () => {
    setLoading(true);
    const req = user.role === 'ADMIN' ? courseAPI.getAll() : courseAPI.getMyCourses();
    req.then(r => {
      const data = r.data.data;
      setCourses(Array.isArray(data) ? data : data.content || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCourses(); }, []);

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
    if (!confirm('Delete this course?')) return;
    try {
      await courseAPI.delete(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{courses.length} courses</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <PlusCircle size={16} /> New Course
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(c => (
            <CourseCard key={c.id} course={c}
              actions={
                <div className="flex gap-2">
                  <Link to={`/courses/${c.id}/lessons`}
                    className="text-xs px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 transition-colors">
                    Lessons
                  </Link>
                  <button onClick={() => openEdit(c)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(c.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Course' : 'Create Course'}>
        <CourseForm initial={editing || {}} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </div>
  );
}
