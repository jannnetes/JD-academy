import { useAuth } from "../auth/AuthContext.jsx";
import StudentDashboard from "./dashboard/StudentDashboard.jsx";
import TeacherDashboard from "./dashboard/TeacherDashboard.jsx";
import AdminDashboard from "./dashboard/AdminDashboard.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === "teacher") return <TeacherDashboard />;
  if (user?.role === "admin") return <AdminDashboard />;
  return <StudentDashboard />;
}
