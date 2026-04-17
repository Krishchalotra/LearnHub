import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { Trash2, Search } from 'lucide-react';
import { SkeletonRow } from '../../components/Skeleton';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const roleColors = { ADMIN: 'bg-red-100 text-red-700', INSTRUCTOR: 'bg-purple-100 text-purple-700', STUDENT: 'bg-green-100 text-green-700' };

export default function ManageUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    userAPI.getAllUsers().then(r => setUsers(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (id === me.id) return toast.error("Can't delete yourself");
    if (!confirm('Delete this user?')) return;
    try {
      await userAPI.deleteUser(id);
      setUsers(u => u.filter(x => x.id !== id));
      toast.success('User deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Users</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{users.length} total users</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Search users..." />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-700/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          <div className="col-span-5">User</div>
          <div className="col-span-3">Role</div>
          <div className="col-span-3">Joined</div>
          <div className="col-span-1" />
        </div>

        {loading ? (
          <div>{[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}</div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filtered.map(u => (
              <div key={u.id} className="grid grid-cols-12 gap-4 items-center px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <div className="col-span-5 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm flex-shrink-0">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="col-span-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[u.role]}`}>{u.role}</span>
                </div>
                <div className="col-span-3 text-xs text-gray-500 dark:text-gray-400">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </div>
                <div className="col-span-1 flex justify-end">
                  <button onClick={() => handleDelete(u.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
