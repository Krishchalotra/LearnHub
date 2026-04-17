import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Profile from './pages/Profile';
import ManageCourses from './pages/instructor/ManageCourses';
import ManageLessons from './pages/instructor/ManageLessons';
import ManageUsers from './pages/admin/ManageUsers';
import AdminManageCourses from './pages/admin/ManageCourses';
import MyLearning from './pages/student/MyLearning';

// Lazy-load heavy PDF page so jsPDF only loads when needed
const CourseCatalogPDF = lazy(() => import('./pages/CourseCatalogPDF'));

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{
            style: { borderRadius: '12px', fontSize: '14px' },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          }} />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected layout — ProtectedRoute renders <Outlet /> */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/courses/:id" element={<CourseDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/student/enrollments" element={<MyLearning />} />
                <Route path="/student/progress" element={<MyLearning />} />
                <Route path="/catalog" element={
                  <Suspense fallback={<div className="flex items-center justify-center h-64 text-gray-400">Loading catalog...</div>}>
                    <CourseCatalogPDF />
                  </Suspense>
                } />

                {/* Instructor / Admin only */}
                <Route element={<ProtectedRoute roles={['INSTRUCTOR', 'ADMIN']} />}>
                  <Route path="/instructor/courses" element={<ManageCourses />} />
                  <Route path="/instructor/courses/new" element={<ManageCourses />} />
                  <Route path="/courses/:courseId/lessons" element={<ManageLessons />} />
                </Route>

                {/* Admin only */}
                <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                  <Route path="/admin/users" element={<ManageUsers />} />
                  <Route path="/admin/courses" element={<AdminManageCourses />} />
                </Route>
              </Route>
            </Route>

            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
