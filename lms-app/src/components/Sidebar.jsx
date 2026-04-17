import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, BookOpen, PlusCircle, Users, GraduationCap,
  BarChart2, User, FileText
} from 'lucide-react';

const navItem = (to, icon, label) => ({ to, icon, label });

const adminNav = [
  navItem('/dashboard',     LayoutDashboard, 'Dashboard'),
  navItem('/courses',       BookOpen,        'Browse Courses'),
  navItem('/admin/courses', BookOpen,        'Manage Courses'),
  navItem('/admin/users',   Users,           'Manage Users'),
  navItem('/catalog',       FileText,        'Course Catalog PDF'),
];

const instructorNav = [
  navItem('/dashboard',          LayoutDashboard, 'Dashboard'),
  navItem('/courses',            BookOpen,        'Browse Courses'),
  navItem('/instructor/courses', BookOpen,        'My Courses'),
  navItem('/catalog',            FileText,        'Course Catalog PDF'),
];

const studentNav = [
  navItem('/dashboard',           LayoutDashboard, 'Dashboard'),
  navItem('/courses',             BookOpen,        'Browse Courses'),
  navItem('/student/enrollments', GraduationCap,   'My Learning'),
  navItem('/student/progress',    BarChart2,       'Progress'),
  navItem('/catalog',             FileText,        'Course Catalog PDF'),
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();

  const navItems = user?.role === 'ADMIN' ? adminNav
    : user?.role === 'INSTRUCTOR' ? instructorNav
    : studentNav;

  return (
    <>
      {/* Overlay for mobile */}
      {open && <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-16 left-0 bottom-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        <nav className="p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`
              }>
              <Icon size={18} />
              <span className="flex-1">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
          <NavLink to="/profile" onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`
            }>
            <User size={18} />
            <span>Profile</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
}
