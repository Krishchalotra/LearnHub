import { useState } from 'react';
import toast from 'react-hot-toast';

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const CATEGORIES = ['Backend', 'Frontend', 'Mobile', 'DevOps', 'Architecture', 'Data Science', 'Security', 'Other'];

export default function CourseForm({ initial = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || '',
    thumbnailUrl: initial.thumbnailUrl || '',
    level: initial.level || 'BEGINNER',
    price: initial.price ?? '',
  });

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    onSubmit({ ...form, price: form.price === '' ? null : Number(form.price) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
        <input value={form.title} onChange={set('title')} required
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Course title" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea value={form.description} onChange={set('description')} rows={3}
          className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
          placeholder="What will students learn?" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select value={form.category} onChange={set('category')}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            <option value="">Select...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Level</label>
          <select value={form.level} onChange={set('level')}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm">
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price ($)</label>
          <input type="number" min="0" step="0.01" value={form.price} onChange={set('price')}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="0 = Free" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail URL</label>
          <input value={form.thumbnailUrl} onChange={set('thumbnailUrl')}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            placeholder="https://..." />
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm">
        {loading ? 'Saving...' : 'Save Course'}
      </button>
    </form>
  );
}
