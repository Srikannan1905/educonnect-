import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, LogOut, LayoutDashboard, Users, BookOpen, Image, Settings, CreditCard, Menu, X, Bell, Check, User, FileText, Award, Upload, Briefcase, ChevronRight, Plus, Calendar, MessageCircle, Info, Globe, Send, Trash2, Eye, Shield } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { StatCard, FeatureCard, NavControls } from '../components/ui/DashCards';

import CourseManager from '../components/admin/CourseManager';
import UserManager from '../components/admin/UserManager';
import GalleryManager from '../components/admin/GalleryManager';
import PaymentManager from '../components/admin/PaymentManager';
import BookingManager from '../components/admin/BookingManager';
import ProfileEditModal from '../components/ProfileEditModal';
import SessionManager from '../components/staff/SessionManager';
import AdminSessionManager from '../components/admin/AdminSessionManager';
import CompanyManager from './admin/CompanyManager';
import QuizManagement from './QuizManagement';
import ActivityManager from '../components/admin/ActivityManager';
import AdminSettings from '../components/admin/AdminSettings';
import SyllabusManager from '../components/admin/SyllabusManager';
import SyllabusViewer from '../components/shared/SyllabusViewer';

export default function Dashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'overview';
    const setActiveTab = (tab) => setSearchParams({ tab });

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [staffRequests, setStaffRequests] = useState([]);
    const [courseRequests, setCourseRequests] = useState([]);
    const [activities, setActivities] = useState([]);
    const [user, setUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                // Redirection Failsafe: Ensure pending staff cannot stay on Dashboard
                if (parsedUser?.role === 'staff' && parsedUser?.status === 'pending') {
                    navigate('/pending-approval', { replace: true });
                } else {
                    setTimeout(() => setUser(parsedUser), 0);
                }
            } catch (err) {
                console.error("Corrupted localStorage user data:", err);
                localStorage.removeItem('user');
                navigate('/login', { replace: true });
            }
        } else {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    async function fetchNotifications() {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(res.data);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    async function fetchStaffRequests() {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/users/staff-requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStaffRequests(res.data);
        } catch (err) {
            console.error("Failed to fetch staff requests");
        }
    };

    async function fetchCourseRequests() {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/courses/requests', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCourseRequests(res.data);
        } catch (err) {
            console.error("Failed to fetch course requests");
        }
    };

    async function fetchActivityLogs() {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/users/activities', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setActivities(res.data);
        } catch (err) {
            console.error("Failed to fetch activities");
        }
    };

    useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'staff') {
                setTimeout(() => fetchNotifications(), 0);
                fetchCourseRequests();
                fetchActivityLogs();
            }
            if (user.role === 'admin') {
                fetchStaffRequests();
            }
        }
    }, [user]);

    async function markAsRead(id) {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications();
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    async function handleStaffAction(id, action) {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/users/staff-requests/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStaffRequests();
            alert(`Staff ${action}d successfully`);
        } catch {
            alert(`Failed to ${action} staff`);
        }
    };

    async function handleCourseRequestAction(id, status) {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/courses/requests/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchCourseRequests();
            alert(`Course request ${status} successfully`);
        } catch {
            alert(`Failed to ${status} course request`);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const renderContent = () => {
        if (!user) return (
            <div className="flex h-full items-center justify-center p-20">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
        switch (activeTab) {
            case 'courses': return <CourseManager />;
            case 'quizzes': return <QuizManagement />;
            case 'students': return <UserManager key="students" role="student" />;
            case 'staff': return <UserManager key="staff" role="staff" />;
            case 'gallery': return <GalleryManager />;
            case 'payments': return <PaymentManager />;
            case 'bookings': return <BookingManager />;
            case 'branding': return <CompanyManager />;
            case 'syllabus': return user?.role === 'admin' ? <SyllabusManager /> : <SyllabusViewer />;
            case 'admin-sessions': return <AdminSessionManager />;
            case 'staff-requests': return (
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-slate-200">Staff Requests</h2>
                    {staffRequests.length === 0 ? <p>No pending requests.</p> : (
                        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-xl overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-transparent border-b border-white/10">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-400">Name</th>
                                        <th className="p-4 font-semibold text-slate-400">Email</th>
                                        <th className="p-4 font-semibold text-slate-400">Phone</th>
                                        <th className="p-4 font-semibold text-slate-400">Qualification</th>
                                        <th className="p-4 font-semibold text-slate-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {staffRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-white/10">
                                            <td className="p-4">{req.name}</td>
                                            <td className="p-4">{req.email}</td>
                                            <td className="p-4">{req.phone || '-'}</td>
                                            <td className="p-4">{req.qualification || '-'}</td>
                                            <td className="p-4 flex gap-2">
                                                <button onClick={() => handleStaffAction(req.id, 'approve')} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium text-sm">Approve</button>
                                                <button onClick={() => handleStaffAction(req.id, 'reject')} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm">Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            );
            case 'proposals': return (
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-slate-200">Course Proposals</h2>
                    {courseRequests.length === 0 ? <p className="text-slate-400">No course proposals Yet.</p> : (
                        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-xl overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-transparent border-b border-white/10">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-400">Course Title</th>
                                        <th className="p-4 font-semibold text-slate-400">Subject</th>
                                        <th className="p-4 font-semibold text-slate-400">Staff</th>
                                        <th className="p-4 font-semibold text-slate-400">Status</th>
                                        {user?.role === 'admin' && <th className="p-4 font-semibold text-slate-400">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {courseRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-white/10">
                                            <td className="p-4 font-bold">{req.title}</td>
                                            <td className="p-4">{req.subject}</td>
                                            <td className="p-4">{req.staff?.name || 'You'}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    req.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            {user?.role === 'admin' && (
                                                <td className="p-4 flex gap-2">
                                                    {req.status === 'pending' && (
                                                        <>
                                                            <button onClick={() => handleCourseRequestAction(req.id, 'approved')} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium text-sm">Approve</button>
                                                            <button onClick={() => handleCourseRequestAction(req.id, 'rejected')} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm">Reject</button>
                                                        </>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            );
            case 'activity-feed': return <ActivityManager activities={activities} onRefresh={fetchActivityLogs} />;
            case 'security': return <AdminSettings />;
            case 'notifications': return (
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold mb-4 text-slate-200">Notifications</h2>
                    {notifications.length === 0 ? <p className="text-slate-400">No new notifications.</p> : (
                        <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-xl overflow-x-auto">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`p-4 border-b border-white/10 flex justify-between items-center transition-all ${notif.isRead ? 'bg-transparent' : 'bg-blue-500/20 border-l-4 border-l-blue-500'}`}>
                                    <div>
                                        <p className={`font-medium ${notif.isRead ? 'text-slate-400' : 'text-white'}`}>{notif.message}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                    </div>
                                    {!notif.isRead && (
                                        <button onClick={() => markAsRead(notif.id)} className="text-blue-600 hover:text-blue-800" title="Mark as Read">
                                            <Check size={20} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
            case 'schedule': return <SessionManager user={user} />;
            default:
                if (user?.role === 'staff') return <StaffOverview user={user} setUser={setUser} />;
                if (user?.role === 'student') return <StudentOverview user={user} setActiveTab={setActiveTab} />;
                return <Overview setActiveTab={setActiveTab} user={user} />;
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] bg-dark-grid flex text-white overflow-hidden relative font-sans">
            {/* Redesigned Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-72 glass-sidebar transition-transform duration-500 ease-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header/Logo Section */}
                    <div className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-8 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-blue-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition duration-500">
                                <BookOpen className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black tracking-tight text-white leading-none">EduConnect</h1>
                                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Management Suite</p>
                            </div>
                        </div>

                        {/* User Profile Summary */}
                        <div className="bg-white/5 rounded-3xl p-5 border border-white/5 mb-6 group hover:bg-white/10 transition duration-500">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white/10">
                                    {user?.profileImage ? (
                                        <img src={`${import.meta.env.VITE_API_URL}${user.profileImage}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-sm font-bold text-white truncate">{user?.name}</h2>
                                    <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1 group-hover:text-blue-400 transition">
                                        <Award size={10} /> {user?.role} Account
                                    </p>
                                    {user?.registrationId && (
                                        <p className="text-[9px] font-black text-blue-500/80 uppercase tracking-tighter mt-0.5">
                                            ID: {user.registrationId}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-full mt-4 py-2 bg-white/5 hover:bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition duration-300 border border-white/5 hover:border-blue-500 flex items-center justify-center gap-2"
                            >
                                <Settings size={12} /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar pt-2">
                        <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} />

                        {(user?.role === 'staff' || user?.role === 'student') && (
                            <SidebarItem icon={<Calendar size={20} />} label="Class Schedule" active={activeTab === 'schedule'} onClick={() => { setActiveTab('schedule'); setIsSidebarOpen(false); }} />
                        )}

                        {(user?.role === 'admin' || user?.role === 'staff') && (
                            <SidebarItem icon={<BookOpen size={20} />} label="Courses" active={activeTab === 'courses'} onClick={() => { setActiveTab('courses'); setIsSidebarOpen(false); }} />
                        )}

                        {user?.role === 'admin' && (
                            <>
                                <SidebarItem icon={<Users size={20} />} label="Staff List" active={activeTab === 'staff'} onClick={() => { setActiveTab('staff'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={<Users size={20} />} label="Student List" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setIsSidebarOpen(false); }} />
                                <SidebarItem
                                    icon={<User size={20} />}
                                    label="Staff Approval"
                                    active={activeTab === 'staff-requests'}
                                    onClick={() => { setActiveTab('staff-requests'); setIsSidebarOpen(false); }}
                                    badge={staffRequests.length > 0 ? staffRequests.length : null}
                                />
                                <SidebarItem icon={<Calendar size={20} />} label="All Sessions" active={activeTab === 'admin-sessions'} onClick={() => { setActiveTab('admin-sessions'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={<CreditCard size={20} />} label="Payments" active={activeTab === 'payments'} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={<Shield size={20} />} label="Security Settings" active={activeTab === 'security'} onClick={() => { setActiveTab('security'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={<Globe size={20} />} label="Branding" active={activeTab === 'branding'} onClick={() => { setActiveTab('branding'); setIsSidebarOpen(false); }} />
                            </>
                        )}

                        <SidebarItem icon={<Calendar size={20} />} label="Bookings" active={activeTab === 'bookings'} onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }} />
                        <SidebarItem icon={<Award size={20} />} label="Assessments" active={activeTab === 'quizzes'} onClick={() => { setActiveTab('quizzes'); setIsSidebarOpen(false); }} />
                        <SidebarItem icon={<Image size={20} />} label="Gallery" active={activeTab === 'gallery'} onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }} />
                        <SidebarItem icon={<BookOpen size={20} />} label="Syllabus" active={activeTab === 'syllabus'} onClick={() => { setActiveTab('syllabus'); setIsSidebarOpen(false); }} />
                        {(user?.role === 'admin' || user?.role === 'staff') && (
                            <>
                                <SidebarItem icon={<FileText size={20} />} label="Course Proposals" active={activeTab === 'proposals'} onClick={() => { setActiveTab('proposals'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={<Briefcase size={20} />} label="Activity Feed" active={activeTab === 'activities'} onClick={() => { setActiveTab('activities'); setIsSidebarOpen(false); }} />
                            </>
                        )}
                        <SidebarItem
                            icon={<Bell size={20} />}
                            label="Notifications"
                            active={activeTab === 'notifications'}
                            onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }}
                            badge={notifications.length > 0 ? notifications.length : null}
                        />
                    </nav>

                    {/* Footer Actions */}
                    <div className="p-6 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl transition duration-500 font-bold group border border-red-500/20"
                        >
                            <LogOut size={20} className="group-hover:-translate-x-1 transition duration-500" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 flex flex-col h-screen overflow-hidden">
                {/* Modern Top Header */}
                <header className="h-20 bg-[#0b0f19]/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-white/5 rounded-xl transition text-white"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-6">
                        <NavControls />
                        <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-sm font-medium uppercase tracking-widest text-[10px]">Portal</span>
                            <ChevronRight size={14} className="text-slate-500" />
                            <span className="text-white font-black capitalize tracking-tight">{activeTab.replace('-', ' ')}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 shadow-inner">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active System</span>
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-dark-grid">
                    <div className="max-w-7xl mx-auto h-full pb-20">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, ease: "circOut" }}
                                className="h-full"
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUser={user}
                onUpdate={handleUserUpdate}
            />
        </div>
    );
}

const SidebarItem = ({ icon, label, active, onClick, badge }) => (
    <button
        onClick={onClick}
        className={`
            w-full group flex items-center justify-between px-5 py-3.5 rounded-2xl transition duration-500 relative overflow-hidden
            ${active
                ? 'bg-blue-600/10 text-blue-400 shadow-[0_0_20px_0_rgba(37,99,235,0.1)] border border-blue-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'}
        `}
    >
        <div className="flex items-center gap-3 relative z-10">
            <span className={`transition-transform duration-500 ${active ? 'scale-110 text-blue-400' : 'group-hover:scale-110 group-hover:text-blue-400'}`}>
                {icon}
            </span>
            <span className="text-sm font-bold tracking-wide">{label}</span>
        </div>

        {badge && (
            <span className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-lg shadow-blue-600/30">
                {badge}
            </span>
        )}

        {active && (
            <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgb(59,130,246)]"
            />
        )}
    </button>
);

function Overview({ setActiveTab, user }) {
    const [stats, setStats] = useState({
        courses: 0, students: 0, staff: 0, requests: 0,
        proposals: 0, gallery: 0, payments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const token = localStorage.getItem('token');
                const authHeader = { headers: { Authorization: `Bearer ${token}` } };
                const [coursesRes, usersRes, galleryRes, paymentsRes, proposalsRes] = await Promise.all([
                    axios.get('/courses'),
                    axios.get('/users', authHeader),
                    axios.get('/gallery'),
                    axios.get('/payments', authHeader),
                    axios.get('/courses/requests', authHeader)
                ]);
                setStats({
                    courses: Array.isArray(coursesRes.data) ? coursesRes.data.length : 0,
                    students: Array.isArray(usersRes.data) ? usersRes.data.filter(u => u.role === 'student').length : 0,
                    staff: Array.isArray(usersRes.data) ? usersRes.data.filter(u => u.role === 'staff' && u.status === 'active').length : 0,
                    requests: Array.isArray(usersRes.data) ? usersRes.data.filter(u => u.role === 'staff' && u.status === 'pending').length : 0,
                    proposals: Array.isArray(proposalsRes.data) ? proposalsRes.data.filter(p => p.status === 'pending').length : 0,
                    gallery: Array.isArray(galleryRes.data) ? galleryRes.data.length : 0,
                    payments: Array.isArray(paymentsRes.data) ? paymentsRes.data.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0) : 0
                });
            } catch (err) {
                console.error("Failed to fetch stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Welcome Back <span className="text-blue-600 animate-pulse">👋</span>
                    </h2>
                    <p className="text-slate-400 font-medium mt-2 italic">You're logged in as <span className="text-blue-600 font-black uppercase text-xs tracking-widest">{user?.role}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('courses')} className="flex items-center gap-2 px-6 py-4 bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass border border-white/10 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-white/10 transition shadow-sm hover:shadow-lg">
                        <BookOpen size={16} /> Audit Courses
                    </button>
                    <button
                        onClick={() => setActiveTab('proposals')}
                        className="flex items-center gap-2 px-8 py-4 bg-blue-600 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95 duration-300"
                    >
                        <Plus size={18} /> New Proposal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Active Courses" value={stats.courses} trend="+12%" icon={<BookOpen size={24} />} color="blue" onClick={() => setActiveTab('courses')} />
                <StatCard title="Total Students" value={stats.students} trend="+8.5%" icon={<Users size={24} />} color="indigo" onClick={() => setActiveTab('users')} />
                <StatCard title="Total Revenue" value={`₹${stats.payments.toLocaleString()}`} trend="+23%" icon={<CreditCard size={24} />} color="emerald" onClick={() => setActiveTab('payments')} />
                <StatCard title="Course Proposals" value={stats.proposals} trend="Actions Required" icon={<FileText size={24} />} color="orange" onClick={() => setActiveTab('proposals')} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-[2.5rem] border border-white/10 shadow-sm p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 group-hover:scale-125 transition duration-1000">
                        <Award size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">Main Command Hub</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Core Operations</p>
                            </div>
                            <button className="bg-white/5 p-3 rounded-2xl hover:bg-slate-100 transition"><ChevronRight size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mt-10">
                            <FeatureCard icon={<BookOpen size={22} />} label="Course Manager" desc="Curriculum Audit" color="blue" onClick={() => setActiveTab('courses')} />
                            <FeatureCard icon={<Award size={22} />} label="Quiz Hub" desc="Exam Monitoring" color="orange" onClick={() => setActiveTab('quizzes')} />
                            <FeatureCard icon={<Briefcase size={22} />} label="Activity Logs" desc="System Oversight" color="emerald" onClick={() => setActiveTab('activity-feed')} />
                            <FeatureCard icon={<BookOpen size={22} />} label="Syllabus" desc="Academic Library" color="indigo" onClick={() => setActiveTab('syllabus')} />
                            <FeatureCard icon={<MessageCircle size={22} />} label="Broadcast" desc="Global Alerts" color="purple" onClick={() => setActiveTab('notifications')} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-8 rounded-[2.5rem] border border-white/10 shadow-sm group cursor-pointer hover:border-blue-200 transition duration-500">
                        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2">
                            <Users size={20} className="text-blue-600" /> Faculty Health
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Staff</span>
                                    <span className="text-sm font-black text-white">{stats.staff}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full group-hover:translate-x-1 transition duration-1000" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Approvals</span>
                                    <span className="text-sm font-black text-red-500">{stats.requests}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => setActiveTab('gallery')} className="group bg-gradient-to-br from-indigo-700 to-blue-800 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-blue-500/30 cursor-pointer overflow-hidden relative">
                        <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition duration-1000">
                            <Image size={240} />
                        </div>
                        <h3 className="text-2xl font-black mb-2 relative z-10">Campus Gallery</h3>
                        <p className="text-indigo-100 text-[11px] font-medium mb-10 relative z-10 opacity-70 leading-relaxed italic">Engage leads with high-fidelity visuals of our dynamic campus culture.</p>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest relative z-10 group-hover:translate-x-3 transition duration-700">
                            View {stats.gallery} Professional Frames <ChevronRight size={16} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// StatCard and QuickAction removed as they are now imported from DashCards.jsx

function CompanySettings() {
    const [company, setCompany] = useState({
        name: '', email: '', phone: '', instagramUrl: '', whatsappNumber: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/company`);
                setCompany(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        setCompany({ ...company, [e.target.name]: e.target.value });
    };

    async function handleSave(e) {
        e.preventDefault();
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/company`, company);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch {
            setMessage('Failed to update settings');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Company Settings</h2>
            {message && <div className={`p-4 rounded mb-4 ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
            <form onSubmit={handleSave} className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-6 rounded-xl shadow-md space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-300 font-semibold mb-2">Company Name</label>
                        <input name="name" value={company.name || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-slate-300 font-semibold mb-2">Contact Email</label>
                        <input name="email" value={company.email || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-slate-300 font-semibold mb-2">Phone</label>
                        <input name="phone" value={company.phone || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 mt-4">
                    <Save size={18} /> Save Changes
                </button>
            </form>
        </div>
    );
}

function StaffOverview({ user, setUser }) {
    const [specialization, setSpecialization] = useState(user?.specialization || '');
    const [bio, setBio] = useState(user?.bio || '');
    const [subjects, setSubjects] = useState(user?.subjects || '');
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingField, setUploadingField] = useState(null);
    const [stats, setStats] = useState({ todaySessions: 0, totalStudents: 0, courses: 0 });
    const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
    const [newProposal, setNewProposal] = useState({ title: '', subject: '', board: 'CBSE', mode: 'online', description: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        async function fetchStaffStats() {
            try {
                const token = localStorage.getItem('token');
                const authHeader = { headers: { Authorization: `Bearer ${token}` } };
                const [sessionsRes, coursesRes] = await Promise.all([
                    axios.get('/sessions/staff', authHeader),
                    axios.get('/courses', authHeader)
                ]);
                const mySessions = Array.isArray(sessionsRes.data) ? sessionsRes.data.filter(s => s.staffId === user.id) : [];
                const myCourses = Array.isArray(coursesRes.data) ? coursesRes.data.filter(c => c.staffId === user.id) : [];
                setStats({
                    todaySessions: mySessions.filter(s => new Date(s.date).toDateString() === new Date().toDateString()).length,
                    totalStudents: myCourses.length * 15 + 5,
                    courses: myCourses.length
                });
            } catch (err) { console.error("Failed to fetch staff stats"); }
        };
        fetchStaffStats();
    }, [user.id]);

    async function saveStaffProfile() {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.put(`/users/${user.id}`,
                { specialization, bio, subjects },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
            alert('Profile updated successfully!');
        } catch { alert('Update failed'); } finally { setIsSaving(false); }
    };

    async function submitProposal(e) {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('/courses/request', newProposal, { headers: { Authorization: `Bearer ${token}` } });
            alert('Course proposal submitted!');
            setIsProposalModalOpen(false);
            setNewProposal({ title: '', subject: '', board: 'CBSE', mode: 'online', description: '' });
        } catch { alert('Failed to submit proposal'); } finally { setIsSubmitting(false); }
    };

    const profileCompletion = [user?.profileImage, user?.specialization, user?.educationPdf, user?.projectPdf, user?.phone, user?.qualification].filter(Boolean).length / 6 * 100;

    return (
        <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Faculty Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200">
                            Faculty Workspace
                        </span>
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Academic Command Center</h2>
                    <p className="text-slate-400 font-medium mt-1">Refine your professional profile and curriculum proposals.</p>
                </div>
                <button
                    onClick={() => setIsProposalModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 rounded-[2rem] text-sm font-black text-white hover:bg-blue-700 transition shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 duration-500"
                >
                    <Plus size={20} /> Propose New Course
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-blue-500/30 transition duration-500">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2">Today's Academic Load</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter">{stats.todaySessions} <span className="text-sm font-medium text-slate-500 uppercase tracking-widest ml-1">Sessions</span></h3>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 group-hover:scale-110 transition duration-500">
                        <Calendar size={32} />
                    </div>
                </div>
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-emerald-500/30 transition duration-500">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Portfolio Volume</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter">{stats.courses} <span className="text-sm font-medium text-slate-500 uppercase tracking-widest ml-1">Active Courses</span></h3>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition duration-500">
                        <BookOpen size={32} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Status */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-10 rounded-[2.5rem] border border-white/5 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Award size={150} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-8 relative z-10">Verification Status</h3>

                        <div className="space-y-8 relative z-10">
                            <div>
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile Completion</span>
                                    <span className="text-sm font-black text-blue-600">{Math.round(profileCompletion)}%</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${profileCompletion}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <StatusItem label="Academic Credentials" field="educationPdf" active={!!user?.educationPdf} user={user} setUser={setUser} uploadingField={uploadingField} setUploadingField={setUploadingField} />
                                <StatusItem label="Research/Projects" field="projectPdf" active={!!user?.projectPdf} user={user} setUser={setUser} uploadingField={uploadingField} setUploadingField={setUploadingField} />
                                <StatusItem label="Identity Verification" field="profileImage" active={!!user?.profileImage} user={user} setUser={setUser} uploadingField={uploadingField} setUploadingField={setUploadingField} />
                            </div>

                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                                <div className="flex gap-4">
                                    <div className="text-blue-600 pt-1"><Info size={20} /></div>
                                    <p className="text-[11px] font-medium text-blue-700 leading-relaxed italic">
                                        Maintaining a 100% profile score increases your visibility to potential students by <span className="font-black">40%</span>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Professional Biodata Form */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl flex flex-col relative overflow-hidden text-white group">
                        <div className="absolute -bottom-10 -right-10 opacity-10 group-hover:scale-125 transition duration-1000 rotate-12">
                            <FileText size={400} />
                        </div>

                        <div className="flex items-center justify-between mb-10 relative z-10">
                            <div>
                                <h3 className="text-2xl font-black tracking-tight">Professional Biodata</h3>
                                <p className="text-blue-300/60 text-[10px] font-bold uppercase tracking-widest mt-1">Identity & Pedagogical Approach</p>
                            </div>
                            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/5">
                                <Settings className="text-blue-400" size={24} />
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div>
                                <label className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Primary Specializations</label>
                                <input
                                    type="text"
                                    value={subjects}
                                    onChange={(e) => { setSubjects(e.target.value); setSpecialization(e.target.value); }}
                                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/30 outline-none transition text-white placeholder-white/20 font-bold"
                                    placeholder="e.g. Theoretical Physics, Quantum Mechanics"
                                />
                            </div>
                            <div>
                                <label className="text-blue-200 text-[10px] font-black uppercase tracking-[0.2em] mb-3 block">Teaching Philosophy & Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] focus:ring-4 focus:ring-blue-500/30 outline-none transition text-white placeholder-white/20 min-h-[180px] resize-none leading-relaxed font-medium"
                                    placeholder="Briefly describe your pedagogical methods, experience, and academic passion..."
                                />
                            </div>

                            <div className="flex gap-4 items-center">
                                <button
                                    onClick={saveStaffProfile}
                                    disabled={isSaving}
                                    className="flex-1 bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 shadow-glass text-blue-400 py-5 rounded-2xl font-black text-sm shadow-2xl hover:bg-blue-500/30 hover:text-blue-300 transition active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSaving ? 'Syncing...' : <><Save size={18} /> Sync Cloud Profile</>}
                                </button>
                                <div className="text-blue-400 italic text-[11px] font-medium opacity-60">
                                    Last synced: {new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposal Modal Overlay */}
            <AnimatePresence>
                {isProposalModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 sm:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
                            onClick={() => setIsProposalModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 border border-white/20"
                        >
                            <div className="bg-gradient-to-br from-slate-900 via-[#0f172a] to-emerald-950 p-10 text-white flex justify-between items-center relative overflow-hidden border-b border-emerald-500/20">
                                <div className="absolute -top-10 -right-10 p-4 opacity-5 rotate-12">
                                    <BookOpen size={200} />
                                </div>
                                <div className="relative z-10 border-l-4 border-emerald-500 pl-6">
                                    <h3 className="text-3xl font-black tracking-tight text-emerald-50">Course Proposal</h3>
                                    <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-[0.2em] mt-2">Official Curriculum Submission</p>
                                </div>
                                <button onClick={() => setIsProposalModalOpen(false)} className="bg-white/5 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 p-3 rounded-full transition relative z-10 border border-white/5 hover:border-emerald-500/30"><X size={24} /></button>
                            </div>

                            <form onSubmit={submitProposal} className="p-10 space-y-8 bg-[#0b1121] max-h-[75vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Proposed Course Title
                                        </label>
                                        <input
                                            required
                                            value={newProposal.title}
                                            onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                                            className="w-full p-5 bg-[#172033] border border-white/5 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition font-medium text-white shadow-inner"
                                            placeholder="e.g. Advanced Particle Physics"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Academic Subject
                                        </label>
                                        <input
                                            required
                                            value={newProposal.subject}
                                            onChange={(e) => setNewProposal({ ...newProposal, subject: e.target.value })}
                                            className="w-full p-5 bg-[#172033] border border-white/5 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition font-medium text-white shadow-inner"
                                            placeholder="e.g. Physics"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Examination Board
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={newProposal.board}
                                                onChange={(e) => setNewProposal({ ...newProposal, board: e.target.value })}
                                                className="w-full p-5 bg-[#172033] border border-white/5 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition font-medium text-white appearance-none shadow-inner"
                                            >
                                                <option value="CBSE" className="bg-slate-900">CBSE</option>
                                                <option value="TN" className="bg-slate-900">TN State Board</option>
                                                <option value="ICSE" className="bg-slate-900">ICSE</option>
                                                <option value="Other" className="bg-slate-900">Other</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Delivery Mode
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={newProposal.mode}
                                                onChange={(e) => setNewProposal({ ...newProposal, mode: e.target.value })}
                                                className="w-full p-5 bg-[#172033] border border-white/5 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition font-medium text-white appearance-none shadow-inner"
                                            >
                                                <option value="online" className="bg-slate-900">Online Learning</option>
                                                <option value="offline" className="bg-slate-900">Offline Campus</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-emerald-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-emerald-500/70 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Syllabus & Curriculum Overview
                                        </label>
                                        <textarea
                                            required
                                            value={newProposal.description}
                                            onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                                            className="w-full p-6 bg-[#172033] border border-white/5 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition min-h-[160px] resize-none font-medium text-white leading-relaxed shadow-inner"
                                            placeholder="Outline the modules, learning outcomes, and prerequisites..."
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-emerald-600 text-white py-5 rounded-xl font-black text-sm hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-500/20 uppercase tracking-widest transition-all active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50 duration-500 border border-emerald-400/50"
                                    >
                                        {isSubmitting ? 'Transmitting Proposal...' : <><Send size={20} /> Dispatch Proposal to Board</>}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const StatusItem = ({ label, field, active, user, setUser, uploadingField, setUploadingField }) => {
    const isUploading = uploadingField === field;

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingField(field);
        const formData = new FormData();
        formData.append('image', file); // The backend upload middleware expects 'image'

        try {
            const token = localStorage.getItem('token');
            const uploadRes = await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });

            const filePath = uploadRes.data;
            const updateRes = await axios.put(`/users/${user.id}`, { [field]: filePath }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setUser(updateRes.data);
            localStorage.setItem('user', JSON.stringify(updateRes.data));
            alert(`${label} uploaded successfully!`);
        } catch (error) {
            console.error(error);
            alert(`Failed to upload ${label}`);
        } finally {
            setUploadingField(null);
            e.target.value = ''; // Reset input
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete ${label}?`)) return;

        try {
            const token = localStorage.getItem('token');
            const updateRes = await axios.put(`/users/${user.id}`, { [field]: null }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(updateRes.data);
            localStorage.setItem('user', JSON.stringify(updateRes.data));
            alert(`${label} deleted successfully!`);
        } catch (error) {
            console.error(error);
            alert(`Failed to delete ${label}`);
        }
    };

    return (
        <div className="relative">
            <input
                type="file"
                id={`upload-${field}`}
                className="hidden"
                onChange={handleFileUpload}
                accept={field === 'profileImage' ? "image/*" : ".pdf,.doc,.docx"}
            />
            {active ? (
                <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <Check size={14} /> {label} Uploaded
                    </span>
                    <div className="flex gap-2">
                        <a
                            href={`${import.meta.env.VITE_API_URL}${user[field]}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition"
                            onClick={(e) => e.stopPropagation()}
                            title="View File"
                        >
                            <Eye size={14} />
                        </a>
                        <button
                            onClick={handleDelete}
                            className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition"
                            title="Delete File"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <label htmlFor={`upload-${field}`} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group cursor-pointer hover:bg-white/10 transition">
                    <span className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition flex items-center gap-2">
                        {isUploading ? <><div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> Uploading...</> : label}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center border border-white/10 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                        <Upload size={12} />
                    </div>
                </label>
            )}
        </div>
    );
};

function StudentOverview({ user, setActiveTab }) {
    const [stats, setStats] = useState({ enrolled: 0, classes: 0, performance: 'Good' });
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        async function fetchStudentStats() {
            try {
                const token = localStorage.getItem('token');
                const authHeader = { headers: { Authorization: `Bearer ${token}` } };
                const [bookingsRes, sessionsRes] = await Promise.all([
                    axios.get('/bookings/my', authHeader),
                    axios.get('/sessions/student', authHeader)
                ]);

                const uniqueCourses = new Set(bookingsRes.data.map(b => b.courseId).filter(Boolean));

                setStats({
                    enrolled: uniqueCourses.size,
                    classes: sessionsRes.data.filter(s => s.status === 'scheduled' || s.status === 'in_progress').length,
                    performance: 'Academic Excellence'
                });
                setSessions(sessionsRes.data.filter(s => s.status === 'scheduled' || s.status === 'in_progress'));
            } catch (err) {
                console.error("Failed to fetch student stats");
            }
        };
        fetchStudentStats();
    }, []);

    return (
        <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-green-100 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-200">
                            Student Portal
                        </span>
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <h2 className="text-4xl font-black text-white tracking-tight">Academic Journey Hub</h2>
                    <p className="text-slate-400 font-medium mt-1 italic">Welcome back, {user?.name}. Manage your courses and upcoming sessions.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-8 rounded-[2.5rem] flex items-center justify-between group h-40">
                    <div className="flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-2 leading-none">Enrolled Courses</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter">{stats.enrolled}</h3>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                        <BookOpen size={32} />
                    </div>
                </div>
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-8 rounded-[2.5rem] flex items-center justify-between group h-40">
                    <div className="flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2 leading-none">Upcoming Classes</p>
                        <h3 className="text-4xl font-black text-white tracking-tighter">{stats.classes}</h3>
                    </div>
                    <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                        <Calendar size={32} />
                    </div>
                </div>
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-8 rounded-[2.5rem] flex items-center justify-between group h-40">
                    <div className="flex flex-col justify-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2 leading-none">Academic Standing</p>
                        <h3 className="text-xl font-black text-white tracking-tight uppercase leading-tight">{stats.performance}</h3>
                    </div>
                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                        <Award size={32} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Live Sessions Widget */}
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-8 rounded-[2.5rem] relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-6 text-blue-400">
                        <Video size={18} />
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] leading-none">Live Classes & Meetings</h3>
                    </div>

                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {sessions.length === 0 ? (
                            <p className="text-slate-400 text-sm italic py-4">No upcoming live sessions scheduled yet.</p>
                        ) : sessions.map(session => (
                            <div key={session.id} className="bg-white/5 border border-white/10 p-5 rounded-3xl group/item hover:bg-white/10 transition">
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className="font-bold text-slate-200">{session.title}</h4>
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${session.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                        {session.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                                    <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(session.date).toLocaleDateString()}</div>
                                    <div className="flex items-center gap-1"><Clock size={12} /> {session.startTime}</div>
                                </div>
                                {session.meetingLink && (
                                    <a
                                        href={session.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                                    >
                                        Join Session <Video size={14} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition duration-1000 rotate-45">
                            <Calendar size={180} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-4 relative z-10">Next Class Entry</h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed italic">Stay organized with your personalized academic schedule. Join your sessions directly from the portal.</p>
                        <button onClick={() => setActiveTab('schedule')} className="px-8 py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition relative z-10 shadow-xl shadow-blue-500/20">
                            Open Schedule Center
                        </button>
                    </div>
                    <div className="bg-slate-900/40 p-10 rounded-[3rem] border border-white/5 relative overflow-hidden group">
                        <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:scale-110 transition duration-1000 -rotate-12">
                            <Award size={180} />
                        </div>
                        <h3 className="text-xl font-black text-white mb-4 relative z-10">Assessments & Grades</h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10 leading-relaxed italic">Track your progress and view quiz results.</p>
                        <button onClick={() => setActiveTab('quizzes')} className="px-8 py-4 bg-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 transition relative z-10 shadow-xl shadow-emerald-500/20">
                            View Vault
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
