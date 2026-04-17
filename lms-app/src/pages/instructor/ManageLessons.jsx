import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { courseAPI, lessonAPI } from '../../services/api';
import Modal from '../../components/Modal';
import { PlusCircle, Pencil, Trash2, GripVertical, Play } from 'lucide-react';
import toast from 'react-hot-toast';

function LessonForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    content: initial.content || '',
    videoUrl: initial.videoUrl || '',
    duration: initial.duration || '',
    orderIndex: initial.orderIndex || 1,
  });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ ...form, duration: Number(form.duration), orderIndex: Number(form.orderIndex) }); }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
        <input value={form.title} onChange={set('title')} required
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
        <textarea value={form.content} onChange={set('content')} rows={3}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Video URL</label>
        <input value={form.videoUrl} onChange={set('videoUrl')}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="https://www.youtube.com/embed/..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration (min)</label>
          <input type="number" value={form.duration} onChange={set('duration')}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Order</label>
          <input type="number" value={form.orderIndex} onChange={set('orderIndex')}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
        {loading ? 'Saving...' : 'Save Lesson'}
      </button>
    </form>
  );
}

export default function ManageLessons() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchData = () => {
    setLoading(true);
    Promise.all([courseAPI.getById(courseId), lessonAPI.getByCourse(courseId)])
      .then(([c, l]) => { setCourse(c.data.data); setLessons(l.data.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const handleSubmit = async (data) => {
    setSaving(true);
    try {
      if (editing) {
        await lessonAPI.update(editing.id, data);
        toast.success('Lesson updated');
      } else {
        await lessonAPI.add(courseId, data);
        toast.success('Lesson added');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await lessonAPI.delete(id);
      toast.success('Lesson deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Lessons</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{course?.title}</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm">
          <PlusCircle size={16} /> Add Lesson
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : lessons.length === 0 ? (
          <div className="p-12 text-center">
            <Play size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">No lessons yet. Add your first lesson.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {lessons.map((lesson, idx) => (
              <div key={lesson.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <GripVertical size={16} className="text-gray-300 flex-shrink-0" />
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-sm font-semibold flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{lesson.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{lesson.duration ? `${lesson.duration} min` : 'No duration set'}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(lesson); setModalOpen(true); }}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(lesson.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Lesson' : 'Add Lesson'}>
        <LessonForm initial={editing || {}} onSubmit={handleSubmit} loading={saving} />
      </Modal>
    </div>
  );
}
