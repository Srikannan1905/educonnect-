import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User as UserIcon, LogOut } from 'lucide-react';

export default function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    let user = {};
    try {
        user = JSON.parse(localStorage.getItem('user') || '{}');
    } catch (e) {
        console.error("Error parsing user from localStorage", e);
        localStorage.removeItem('user'); // Clear invalid data
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-blue-600 text-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold flex items-center gap-2">
                    <BookOpen /> EduConnect
                </Link>
                <div className="space-x-6 flex items-center">
                    <Link to="/" className="hover:text-blue-200 font-medium">Home</Link>
                    <Link to="/courses" className="hover:text-blue-200 font-medium">Courses</Link>
                    <Link to="/gallery" className="hover:text-blue-200 font-medium">Gallery</Link>

                    {token ? (
                        <div className="flex items-center gap-4">
                            {user.role === 'student' && (
                                <Link to="/student-dashboard" className="hover:text-blue-200 font-medium">My Dashboard</Link>
                            )}
                            {(user.role === 'admin' || user.role === 'staff') && (
                                <Link to="/dashboard" className="hover:text-blue-200 font-medium">Dashboard</Link>
                            )}
                            <span className="flex items-center gap-1"><UserIcon size={16} /> {user.name}</span>
                            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm flex items-center gap-1">
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 font-semibold transition">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
