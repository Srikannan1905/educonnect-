import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { BookOpen } from 'lucide-react';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StaffRegister from './pages/StaffRegister';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import StudentDashboard from './pages/StudentDashboard';
import PaymentPage from './pages/PaymentPage';
import Gallery from './pages/Gallery';
import Invoice from './pages/Invoice';
import PendingApproval from './pages/PendingApproval';
import ResetPassword from './pages/ResetPassword';
import CourseRoom from './pages/CourseRoom';
import QuizPlayer from './pages/QuizPlayer';
import QuizManagement from './pages/QuizManagement';
import QuizEditor from './pages/QuizManagement/QuizEditor';
import WhatsAppButton from './components/ui/WhatsAppButton';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import QuizHub from './pages/QuizHub';

// Configure Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.withCredentials = true;

// Add a request interceptor to include the auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle globally expired tokens (401 Unauthorized)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Protected Route Component
import { Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import ErrorBoundary from './components/ErrorBoundary';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" replace />;

  if (user.role === 'staff' && user.status === 'pending') {
    return <Navigate to="/pending-approval" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <ToastProvider>
          <div className="min-h-screen bg-transparent flex flex-col">
            <Navbar />
            <div className="flex-grow pb-32 md:pb-24">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/staff-register" element={<StaffRegister />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />

                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Dashboard /></ProtectedRoute>} />
                <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute allowedRoles={['student']}><PaymentPage /></ProtectedRoute>} />
                <Route path="/invoice/:paymentId" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
                <Route path="/pending-approval" element={<PendingApproval />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                <Route path="/course/:id" element={<ProtectedRoute allowedRoles={['student']}><CourseRoom /></ProtectedRoute>} />
                <Route path="/quizzes" element={<ProtectedRoute><QuizHub /></ProtectedRoute>} />
                <Route path="/quiz/:id" element={<ProtectedRoute><QuizPlayer /></ProtectedRoute>} />
                <Route path="/dashboard/quizzes" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><QuizManagement /></ProtectedRoute>} />
                <Route path="/dashboard/quiz/new" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><QuizEditor /></ProtectedRoute>} />
                <Route path="/dashboard/quiz/edit/:id" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><QuizEditor /></ProtectedRoute>} />
              </Routes>
            </div>
            <Footer />
            <WhatsAppButton />
          </div>
        </ToastProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
