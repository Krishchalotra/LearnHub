import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const DEMO_ACCOUNTS = [
  { label: 'Admin', email: 'admin@lms.com', role: 'ADMIN', color: 'bg-red-50 border-red-200 text-red-700' },
  { label: 'Instructor', email: 'instructor@lms.com', role: 'INSTRUCTOR', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { label: 'Student', email: 'student@lms.com', role: 'STUDENT', color: 'bg-green-50 border-green-200 text-green-700' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid credentials');
    }
  };

  const fillDemo = (acc) => { setEmail(acc.email); setPassword('password'); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to LearnHub</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Sign in to continue learning</p>
        </div>

        {/* Demo accounts */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-2">Quick demo login</p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.role} onClick={() => fillDemo(acc)}
                className={`text-xs font-medium py-2 px-3 rounded-xl border transition-all hover:shadow-sm ${acc.color}`}>
                {acc.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors text-sm shadow-sm">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            No account? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
