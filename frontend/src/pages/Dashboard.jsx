import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, LogOut, LayoutDashboard, Users, BookOpen, Image, Settings, CreditCard, Menu, X, Bell, Check, UserPlus, User, FileText, Award, Upload, ExternalLink, Briefcase, ChevronRight, Plus, Calendar, MessageCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import CourseManager from '../components/admin/CourseManager';
import UserManager from '../components/admin/UserManager';
import GalleryManager from '../components/admin/GalleryManager';
import PaymentManager from '../components/admin/PaymentManager';
import ProfileEditModal from '../components/ProfileEditModal';
import SessionManager from '../components/staff/SessionManager';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
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
            const parsedUser = JSON.parse(storedUser);
            // Redirection Failsafe: Ensure pending staff cannot stay on Dashboard
            if (parsedUser.role === 'staff' && parsedUser.status === 'pending') {
                navigate('/pending-approval');
            } else {
                setTimeout(() => setUser(parsedUser), 0);
            }
        } else {
            navigate('/login');
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
        switch (activeTab) {
            case 'courses': return <CourseManager />;
            case 'students': return <UserManager role="student" />;
            case 'staff': return <UserManager role="staff" />;
            case 'gallery': return <GalleryManager />;
            case 'payments': return <PaymentManager />;
            case 'settings': return <CompanySettings />;
            case 'staff-requests': return (
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Staff Requests</h2>
                    {staffRequests.length === 0 ? <p>No pending requests.</p> : (
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Name</th>
                                        <th className="p-4 font-semibold text-gray-600">Email</th>
                                        <th className="p-4 font-semibold text-gray-600">Phone</th>
                                        <th className="p-4 font-semibold text-gray-600">Qualification</th>
                                        <th className="p-4 font-semibold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {staffRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50">
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
            case 'course-proposals': return (
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">Course Proposals</h2>
                    {courseRequests.length === 0 ? <p className="text-gray-500">No course proposals Yet.</p> : (
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Course Title</th>
                                        <th className="p-4 font-semibold text-gray-600">Subject</th>
                                        <th className="p-4 font-semibold text-gray-600">Staff</th>
                                        <th className="p-4 font-semibold text-gray-600">Status</th>
                                        {user.role === 'admin' && <th className="p-4 font-semibold text-gray-600">Actions</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {courseRequests.map(req => (
                                        <tr key={req.id} className="hover:bg-gray-50">
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
                                            {user.role === 'admin' && req.status === 'pending' && (
                                                <td className="p-4 flex gap-2">
                                                    <button onClick={() => handleCourseRequestAction(req.id, 'approved')} className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 font-medium text-sm">Approve</button>
                                                    <button onClick={() => handleCourseRequestAction(req.id, 'rejected')} className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium text-sm">Reject</button>
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
            case 'activity-feed': return (
                <div>
                    <h2 className="text-3xl font-bold mb-6 text-gray-800">System Activity Feed</h2>
                    <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                        <div className="divide-y divide-gray-50">
                            {activities.length === 0 ? <div className="p-8 text-center text-gray-500 italic">No recent activity detected.</div> : activities.map(act => (
                                <div key={act.id} className="p-6 hover:bg-gray-50/80 transition flex gap-5 items-start">
                                    <div className={`p-3 rounded-2xl ${act.action === 'session_started' ? 'bg-green-100 text-green-600' :
                                        act.action === 'session_ended' ? 'bg-orange-100 text-orange-600' :
                                            act.action === 'booking_created' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <Bell size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-bold text-gray-800 capitalize">{act.action.replace('_', ' ')}</h4>
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(act.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 font-medium">{act.details}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-900 text-white font-black uppercase tracking-[0.1em]">{act.user?.role || act.userRole}</span>
                                            <span className="text-[10px] text-gray-400 font-bold italic">{act.user?.name || 'System User'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
            case 'notifications': return (
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold mb-4 text-gray-800">Notifications</h2>
                    {notifications.length === 0 ? <p className="text-gray-500">No new notifications.</p> : (
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            {notifications.map(notif => (
                                <div key={notif.id} className={`p-4 border-b flex justify-between items-center ${notif.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}>
                                    <div>
                                        <p className={`font-medium ${notif.isRead ? 'text-gray-600' : 'text-gray-900'}`}>{notif.message}</p>
                                        <p className="text-xs text-gray-500">{new Date(notif.createdAt).toLocaleString()}</p>
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
            case 'schedule': return <SessionManager />;
            default:
                if (user?.role === 'staff') return <StaffOverview user={user} setUser={setUser} />;
                return <Overview setActiveTab={setActiveTab} user={user} />;
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] bg-dashboard-grid flex text-slate-900 overflow-hidden relative font-sans">
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
                                        <img src={`http://localhost:5000${user.profileImage}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <User size={24} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h2 className="text-sm font-bold text-white truncate">{user?.name}</h2>
                                    <p className="text-[10px] text-slate-400 capitalize flex items-center gap-1 group-hover:text-blue-400 transition">
                                        <Award size={10} /> {user?.role} Account
                                    </p>
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

                        {user?.role === 'staff' && (
                            <SidebarItem icon={<Calendar size={20} />} label="Class Schedule" active={activeTab === 'schedule'} onClick={() => { setActiveTab('schedule'); setIsSidebarOpen(false); }} />
                        )}

                        {(user?.role === 'admin' || user?.role === 'staff') && (
                            <SidebarItem icon={<BookOpen size={20} />} label="Courses" active={activeTab === 'courses'} onClick={() => { setActiveTab('courses'); setIsSidebarOpen(false); }} />
                        )}

                        {user?.role === 'admin' && (
                            <>
                                <SidebarItem icon={<Users size={20} />} label="Total Users" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} />
                                <SidebarItem icon={<CreditCard size={20} />} label="Payments" active={activeTab === 'payments'} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }} />
                            </>
                        )}

                        <SidebarItem icon={<Image size={20} />} label="Gallery" active={activeTab === 'gallery'} onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }} />
                        <SidebarItem icon={<FileText size={20} />} label="Course Proposals" active={activeTab === 'proposals'} onClick={() => { setActiveTab('proposals'); setIsSidebarOpen(false); }} />
                        <SidebarItem icon={<Briefcase size={20} />} label="Activity Feed" active={activeTab === 'activities'} onClick={() => { setActiveTab('activities'); setIsSidebarOpen(false); }} />
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
                <header className="h-20 bg-white/60 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-30">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-sm font-medium uppercase tracking-widest text-[10px]">Portal</span>
                        <ChevronRight size={14} className="text-slate-300" />
                        <span className="text-slate-900 font-black capitalize tracking-tight">{activeTab.replace('-', ' ')}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl border border-slate-200 animate-pulse">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active System</span>
                        </div>
                    </div>
                </header>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-dashboard-grid">
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
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        Welcome Back <span className="text-blue-600 animate-pulse">👋</span>
                    </h2>
                    <p className="text-slate-500 font-medium mt-2 italic">You're logged in as <span className="text-blue-600 font-black uppercase text-xs tracking-widest">{user?.role}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setActiveTab('courses')} className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition shadow-sm hover:shadow-lg">
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
                <StatCard title="Active Courses" value={stats.courses} trend="+12%" icon={<BookOpen size={24} />} color="blue" />
                <StatCard title="Total Students" value={stats.students} trend="+8.5%" icon={<Users size={24} />} color="indigo" />
                <StatCard title="Total Revenue" value={`₹${stats.payments.toLocaleString()}`} trend="+23%" icon={<CreditCard size={24} />} color="emerald" />
                <StatCard title="Course Proposals" value={stats.proposals} trend="Actions Required" icon={<FileText size={24} />} color="orange" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 group-hover:scale-125 transition duration-1000">
                        <Award size={200} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Main Command Hub</h3>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Core Operations</p>
                            </div>
                            <button className="bg-slate-50 p-3 rounded-2xl hover:bg-slate-100 transition"><ChevronRight size={20} /></button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <QuickAction icon={<BookOpen size={20} />} label="Course Manager" desc="Audit curriculum & content" color="blue" onClick={() => setActiveTab('courses')} />
                            <QuickAction icon={<Users size={20} />} label="User Directory" desc="Manage roles & permissions" color="indigo" onClick={() => setActiveTab('users')} />
                            <QuickAction icon={<MessageCircle size={20} />} label="Broadcast" desc="Send system-wide alerts" color="purple" onClick={() => setActiveTab('notifications')} />
                            <QuickAction icon={<FileText size={20} />} label="Review Board" desc="Process faculty proposals" color="orange" onClick={() => setActiveTab('proposals')} />
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm group cursor-pointer hover:border-blue-200 transition duration-500">
                        <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                            <Users size={20} className="text-blue-600" /> Faculty Health
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Active Staff</span>
                                    <span className="text-sm font-black text-slate-900">{stats.staff}</span>
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

function StatCard({ title, value, icon, color, trend }) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100 shadow-blue-500/10',
        indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-indigo-500/10',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-500/10',
        orange: 'text-orange-600 bg-orange-50 border-orange-100 shadow-orange-500/10',
        purple: 'text-purple-600 bg-purple-50 border-purple-100 shadow-purple-500/10'
    };
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(30,41,59,0.03)] group hover:shadow-[0_40px_60px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-3 transition duration-700 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-3xl border ${colorClasses[color || 'blue']} transition duration-700 group-hover:scale-110 group-hover:shadow-xl`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <h4 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{value}</h4>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-150 group-hover:rotate-12 transition duration-1000 pointer-events-none">
                {icon}
            </div>
        </div>
    );
}

function QuickAction({ icon, label, desc, color, onClick }) {
    const colors = {
        blue: 'from-blue-500 to-blue-600 shadow-blue-500/30',
        indigo: 'from-indigo-500 to-indigo-600 shadow-indigo-500/30',
        purple: 'from-purple-500 to-purple-600 shadow-purple-500/30',
        orange: 'from-orange-500 to-orange-600 shadow-orange-500/30',
    };
    return (
        <button onClick={onClick} className="flex items-center gap-6 p-6 bg-white border border-slate-100 rounded-[2rem] hover:border-blue-200 hover:bg-slate-50/50 transition duration-700 group text-left shadow-sm">
            <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition duration-700`}>
                {icon}
            </div>
            <div>
                <h4 className="text-base font-black text-slate-900 mb-1">{label}</h4>
                <p className="text-[11px] font-medium text-slate-400 leading-tight tracking-wide">{desc}</p>
            </div>
            <ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-blue-500 group-hover:translate-x-2 transition duration-700" />
        </button>
    );
}

function CompanySettings() {
    const [company, setCompany] = useState({
        name: '', email: '', phone: '', instagramUrl: '', whatsappNumber: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await axios.get('http://localhost:5000/api/company');
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
            await axios.put('http://localhost:5000/api/company', company);
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
            <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-md space-y-4 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Company Name</label>
                        <input name="name" value={company.name || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Contact Email</label>
                        <input name="email" value={company.email || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Phone</label>
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
                    axios.get('/sessions', authHeader),
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
            const res = await axios.put(`/users/${user.id}`, { specialization, bio, subjects });
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
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Academic Command Center</h2>
                    <p className="text-slate-500 font-medium mt-1">Refine your professional profile and curriculum proposals.</p>
                </div>
                <button
                    onClick={() => setIsProposalModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-10 py-5 bg-blue-600 rounded-[2rem] text-sm font-black text-white hover:bg-blue-700 transition shadow-2xl shadow-blue-500/30 hover:scale-105 active:scale-95 duration-500"
                >
                    <Plus size={20} /> Propose New Course
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition duration-500">
                    <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition duration-500">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Today's Sessions</p>
                        <h4 className="text-3xl font-black text-slate-900">{stats.todaySessions}</h4>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition duration-500">
                    <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition duration-500">
                        <Users size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Students</p>
                        <h4 className="text-3xl font-black text-slate-900">{stats.totalStudents}</h4>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:shadow-xl transition duration-500">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition duration-500">
                        <BookOpen size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Courses</p>
                        <h4 className="text-3xl font-black text-slate-900">{stats.courses}</h4>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Status */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Award size={150} />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 mb-8 relative z-10">Verification Status</h3>

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
                                <StatusItem label="Academic Credentials" active={!!user?.educationPdf} />
                                <StatusItem label="Research/Projects" active={!!user?.projectPdf} />
                                <StatusItem label="Identity Verification" active={!!user?.profileImage} />
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
                                    onChange={(e) => setSubjects(e.target.value)}
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
                                    className="flex-1 bg-white text-slate-900 py-5 rounded-2xl font-black text-sm shadow-2xl hover:bg-blue-50 transition active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
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
                            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 border border-white/20"
                        >
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <BookOpen size={120} />
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-3xl font-black tracking-tight">Course Proposal</h3>
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mt-2">Curriculum Submission Portal</p>
                                </div>
                                <button onClick={() => setIsProposalModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition relative z-10"><X size={24} /></button>
                            </div>

                            <form onSubmit={submitProposal} className="p-10 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Proposed Course Title</label>
                                        <input
                                            required
                                            value={newProposal.title}
                                            onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
                                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition font-bold text-slate-900"
                                            placeholder="e.g. Advanced Particle Physics"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Academic Subject</label>
                                        <input
                                            required
                                            value={newProposal.subject}
                                            onChange={(e) => setNewProposal({ ...newProposal, subject: e.target.value })}
                                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition font-bold"
                                            placeholder="e.g. Physics"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Examination Board</label>
                                        <select
                                            value={newProposal.board}
                                            onChange={(e) => setNewProposal({ ...newProposal, board: e.target.value })}
                                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition font-bold appearance-none"
                                        >
                                            <option value="CBSE">CBSE</option>
                                            <option value="TN">TN State Board</option>
                                            <option value="ICSE">ICSE</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Syllabus & Curriculum Overview</label>
                                    <textarea
                                        required
                                        value={newProposal.description}
                                        onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
                                        className="w-full p-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 outline-none transition min-h-[140px] resize-none font-medium text-slate-600 leading-relaxed"
                                        placeholder="Outline the modules, learning outcomes, and prerequisites..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-lg hover:bg-blue-700 transition shadow-2xl shadow-blue-500/30 active:scale-95 flex justify-center items-center gap-3 disabled:opacity-50 duration-500"
                                >
                                    {isSubmitting ? 'Transmitting Proposal...' : <><Send size={22} /> Dispatch Proposal</>}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const StatusItem = ({ label, active }) => (
    <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group">
        <span className="text-xs font-bold text-slate-500 group-hover:text-slate-900 transition">{label}</span>
        {active ? (
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                <Check size={14} />
            </div>
        ) : (
            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center border border-slate-200">
                <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
            </div>
        )}
    </div>
);
