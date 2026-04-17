import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, LogOut, User, BookOpen, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const roleColors = {
  ADMIN: 'bg-red-100 text-red-700',
  INSTRUCTOR: 'bg-purple-100 text-purple-700',
  STUDENT: 'bg-green-100 text-green-700',
};

export default function Navbar({ onMenuToggle, sidebarOpen }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center px-4 gap-4 shadow-sm">
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <Link to="/" className="flex items-center gap-2 font-bold text-xl text-indigo-600 dark:text-indigo-400">
        <BookOpen size={24} />
        <span className="hidden sm:block">LearnHub</span>
      </Link>

      <div className="flex-1" />

      <button
        onClick={toggle}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(o => !o)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold select-none">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">{user.name}</p>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${roleColors[user.role]}`}>
                {user.role}
              </span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <User size={16} /> Profile
              </Link>
              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
              <button
                onMouseDown={(e) => e.preventDefault()} // prevent blur before click
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

