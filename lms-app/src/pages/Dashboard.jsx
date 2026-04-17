import { useAuth } from '../context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import InstructorDashboard from './dashboards/InstructorDashboard';
import StudentDashboard from './dashboards/StudentDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'INSTRUCTOR') return <InstructorDashboard />;
  return <StudentDashboard />;
}
