import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, User as UserIcon, LogOut, Menu, X } from 'lucide-react';
import { NavControls } from './ui/DashCards';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('token');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    // Hide Navbar completely on dashboard application views
    if (location.pathname.includes('/dashboard') || location.pathname.includes('/student-dashboard')) {
        return null;
    }

    return (
        <nav className="bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/10 text-white p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-8">
                    <Link to="/" className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen /> EduConnect
                    </Link>
                    <div className="hidden sm:block">
                        <NavControls />
                    </div>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white hover:text-blue-200 focus:outline-none"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

                {/* Desktop Navigation */}
                <div className="hidden md:flex space-x-6 items-center">
                    <Link to="/" className="hover:text-blue-200 font-medium">Home</Link>
                    <Link to="/courses" className="hover:text-blue-200 font-medium">Courses</Link>
                    <Link to="/quizzes" className="hover:text-blue-200 font-medium">Assessments</Link>
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
                        <Link to="/login" className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl text-blue-400 px-4 py-2 rounded-lg hover:bg-white/10 font-semibold transition">Login</Link>
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-full left-0 w-full bg-[#0b0f19]/95 backdrop-blur-xl border-b border-white/10 pb-4 shadow-2xl flex flex-col space-y-4 pt-4 px-4 z-50">
                    <Link to="/" className="hover:text-blue-200 font-medium px-2" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to="/courses" className="hover:text-blue-200 font-medium px-2" onClick={() => setIsMenuOpen(false)}>Courses</Link>
                    <Link to="/quizzes" className="hover:text-blue-200 font-medium px-2" onClick={() => setIsMenuOpen(false)}>Assessments</Link>
                    <Link to="/gallery" className="hover:text-blue-200 font-medium px-2" onClick={() => setIsMenuOpen(false)}>Gallery</Link>

                    {token ? (
                        <div className="flex flex-col gap-4 px-2 pt-2 border-t border-white/10">
                            <span className="flex items-center gap-2 text-slate-300"><UserIcon size={16} /> {user.name}</span>
                            {user.role === 'student' && (
                                <Link to="/student-dashboard" className="hover:text-blue-200 font-medium" onClick={() => setIsMenuOpen(false)}>My Dashboard</Link>
                            )}
                            {(user.role === 'admin' || user.role === 'staff') && (
                                <Link to="/dashboard" className="hover:text-blue-200 font-medium" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                            )}
                            <button onClick={handleLogout} className="bg-red-500 w-fit hover:bg-red-600 px-4 py-2 rounded text-sm flex items-center gap-2">
                                <LogOut size={14} /> Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 w-fit text-blue-400 px-6 py-2 rounded-lg hover:bg-white/10 font-semibold transition mt-2 mx-2" onClick={() => setIsMenuOpen(false)}>Login</Link>
                    )}
                </div>
            )}
        </nav>
    );
}
