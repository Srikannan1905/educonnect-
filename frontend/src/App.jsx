import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { BookOpen } from 'lucide-react';

import Navbar from './components/Navbar';
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
// Footer removed for reconstruction

// Configure Axios
axios.defaults.baseURL = '/api';

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

// Protected Route Component (Inline because it's small)
import { Navigate } from 'react-router-dom';
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token) return <Navigate to="/login" />;

  // New: If staff is pending, send to waiting page
  if (user.role === 'staff' && user.status === 'pending') {
    return <Navigate to="/pending-approval" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;

  return children;
};


import { ToastProvider } from './components/ui/Toast';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <ToastProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/staff-register" element={<StaffRegister />} /> {/* Added StaffRegister route */}
                <Route path="/courses" element={<Courses />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/centers" element={<div className="p-8 text-center text-xl">Centers Page (Coming Soon)</div>} />

                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Dashboard /></ProtectedRoute>} />
                <Route path="/student-dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute allowedRoles={['student']}><PaymentPage /></ProtectedRoute>} />
                <Route path="/invoice/:paymentId" element={<ProtectedRoute><Invoice /></ProtectedRoute>} />
                <Route path="/pending-approval" element={<PendingApproval />} />
              </Routes>
            </div>
            {/* Footer Removed */}
          </div>
        </ToastProvider>
      </ErrorBoundary>
    </Router>
  );
}



export default App;
