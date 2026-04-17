import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { User, Mail, Shield, Calendar, Pencil, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const roleColors = { ADMIN: 'bg-red-100 text-red-700', INSTRUCTOR: 'bg-purple-100 text-purple-700', STUDENT: 'bg-green-100 text-green-700' };

export default function Profile() {
  const { user, login } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', avatarUrl: user?.avatarUrl || '' });
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await userAPI.updateProfile(form);
      // Update local storage
      const updated = { ...user, ...form };
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your account</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[user?.role]}`}>{user?.role}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
            {user?.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{user.bio}</p>}
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <Pencil size={14} /> Edit
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4 border-t border-gray-100 dark:border-gray-700 pt-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input value={form.name} onChange={set('name')}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
              <textarea value={form.bio} onChange={set('bio')} rows={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar URL</label>
              <input value={form.avatarUrl} onChange={set('avatarUrl')}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="https://..." />
            </div>
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors">
                <Check size={14} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setEditing(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: User, label: 'Name', value: user?.name },
              { icon: Mail, label: 'Email', value: user?.email },
              { icon: Shield, label: 'Role', value: user?.role },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Icon size={16} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{value}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
