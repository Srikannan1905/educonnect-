import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, LogOut, LayoutDashboard, Users, BookOpen, Image, Settings, CreditCard, Menu, X, Bell, Check, UserPlus, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import CourseManager from '../components/admin/CourseManager';
import UserManager from '../components/admin/UserManager';
import GalleryManager from '../components/admin/GalleryManager';
import PaymentManager from '../components/admin/PaymentManager';
import ProfileEditModal from '../components/ProfileEditModal';

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [staffRequests, setStaffRequests] = useState([]);
    const [user, setUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchNotifications = async () => {
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

    const fetchStaffRequests = async () => {
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

    useEffect(() => {
        if (user && user.role === 'admin') {
            // fetchStats is called within the Overview component, not here.
            // If Dashboard itself needs stats, they should be fetched here.
            // For now, only fetch notifications if user is admin.
            fetchNotifications();
            fetchStaffRequests();
        }
    }, [user]); // Depend on user state

    const markAsRead = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNotifications(); // Re-fetch to update read status
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    const handleStaffAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/users/staff-requests/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchStaffRequests(); // Refresh list
            alert(`Staff ${action}d successfully`);
        } catch (err) {
            alert(`Failed to ${action} staff`);
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
            default: return <Overview setActiveTab={setActiveTab} />;
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Sync local storage
    };

    return (
        <div className="min-h-screen bg-gray-50 flex relative">
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUser={user}
                onUpdate={handleUserUpdate}
            />

            {/* Mobile Menu Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 right-4 z-50 bg-blue-900 text-white p-2 rounded-full shadow-lg"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                w-64 bg-blue-900 text-white min-h-screen p-4 flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="mb-8 text-center border-b border-blue-800 pb-4">
                    <h1 className="text-2xl font-bold flex items-center justify-center gap-2 mb-4">
                        <LayoutDashboard size={28} /> EduAdmin
                    </h1>
                    {/* User Profile Summary in Sidebar */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-blue-400 mb-2 bg-blue-800">
                            {user?.profileImage ? (
                                <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={32} className="text-blue-300" />
                                </div>
                            )}
                        </div>
                        <p className="font-semibold">{user?.name}</p>
                        <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="text-xs text-blue-300 hover:text-white mt-1 hover:underline"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                <nav className="space-y-2 flex-grow">
                    <SidebarItem icon={<LayoutDashboard size={20} />} label="Overview" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={<BookOpen size={20} />} label="Courses" active={activeTab === 'courses'} onClick={() => { setActiveTab('courses'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={<Users size={20} />} label="Students" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={<Users size={20} />} label="Staff List" active={activeTab === 'staff'} onClick={() => { setActiveTab('staff'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={<UserPlus size={20} />} label="Staff Requests" active={activeTab === 'staff-requests'} onClick={() => { setActiveTab('staff-requests'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={<CreditCard size={20} />} label="Payments" active={activeTab === 'payments'} onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={<Image size={20} />} label="Gallery" active={activeTab === 'gallery'} onClick={() => { setActiveTab('gallery'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={<Bell size={20} />} label="Notifications" active={activeTab === 'notifications'} onClick={() => { setActiveTab('notifications'); setIsSidebarOpen(false); }} />
                    <SidebarItem icon={<Settings size={20} />} label="Settings" active={activeTab === 'settings'} onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); }} />
                </nav>
                <button onClick={handleLogout} className="mt-4 flex items-center gap-2 text-red-300 hover:text-white hover:bg-red-900/50 p-2 rounded w-full transition">
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 transition-all duration-300">
                <div className="max-w-6xl mx-auto mt-12 lg:mt-0">
                    {renderContent()}
                </div>
            </main>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left py-3 px-4 rounded-lg flex items-center gap-3 transition ${active ? 'bg-blue-700 text-white shadow-lg' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
        >
            {icon}
            <span className="font-semibold">{label}</span>
        </button>
    );
}

function Overview({ setActiveTab }) {
    const [stats, setStats] = useState({
        courses: 0,
        students: 0,
        staff: 0,
        requests: 0,
        gallery: 0,
        payments: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const authHeader = { headers: { Authorization: `Bearer ${token}` } };

                const [coursesRes, usersRes, galleryRes, paymentsRes] = await Promise.all([
                    axios.get('/courses'),
                    axios.get('/users', authHeader),
                    axios.get('/gallery'),
                    axios.get('/payments', authHeader)
                ]);

                setStats({
                    courses: coursesRes.data.length,
                    students: usersRes.data.filter(u => u.role === 'student').length,
                    staff: usersRes.data.filter(u => u.role === 'staff' && u.status === 'active').length,
                    requests: usersRes.data.filter(u => u.role === 'staff' && u.status === 'pending').length,
                    gallery: galleryRes.data.length,
                    payments: paymentsRes.data.reduce((acc, curr) => acc + parseFloat(curr.amount), 0)
                });
            } catch (err) {
                console.error("Failed to fetch stats");
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard title="Total Courses" value={stats.courses} icon={<BookOpen size={30} />} color="bg-blue-500" />
                <StatCard title="Active Students" value={stats.students} icon={<Users size={30} />} color="bg-green-500" />
                <StatCard title="Active Staff" value={stats.staff} icon={<Users size={30} />} color="bg-indigo-500" />
                <StatCard title="Staff Requests" value={stats.requests} icon={<UserPlus size={30} />} color="bg-yellow-500" />
                <StatCard title="Gallery Photos" value={stats.gallery} icon={<Image size={30} />} color="bg-purple-500" />
                <StatCard title="Total Revenue" value={`₹${stats.payments}`} icon={<CreditCard size={30} />} color="bg-orange-500" />
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button onClick={() => setActiveTab('courses')} className="px-6 py-4 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 font-bold transition border border-blue-100 flex flex-col items-center gap-2">
                        <BookOpen size={24} /> Manage Courses
                    </button>
                    <button onClick={() => setActiveTab('users')} className="px-6 py-4 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 font-bold transition border border-green-100 flex flex-col items-center gap-2">
                        <Users size={24} /> View Users
                    </button>
                    <button onClick={() => setActiveTab('gallery')} className="px-6 py-4 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 font-bold transition border border-purple-100 flex flex-col items-center gap-2">
                        <Image size={24} /> Upload Photos
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-transparent hover:border-blue-500 transition flex items-center justify-between group hover:-translate-y-1 duration-300">
            <div>
                <h4 className="text-gray-500 text-sm font-semibold uppercase">{title}</h4>
                <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
            </div>
            <div className={`${color} text-white p-3 rounded-lg shadow-lg group-hover:scale-110 transition`}>
                {icon}
            </div>
        </div>
    );
}

function CompanySettings() {
    const [company, setCompany] = useState({
        name: '',
        email: '',
        phone: '',
        instagramUrl: '',
        whatsappNumber: '',
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
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

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await axios.put('http://localhost:5000/api/company', company);
            setMessage('Settings updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
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
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">WhatsApp Number (with country code, no +)</label>
                        <input name="whatsappNumber" value={company.whatsappNumber || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="919876543210" />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">Instagram URL</label>
                        <input name="instagramUrl" value={company.instagramUrl || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">X (Twitter) URL</label>
                        <input name="twitterUrl" value={company.twitterUrl || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://x.com/..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 font-semibold mb-2">Address</label>
                        <textarea name="address" value={company.address || ''} onChange={handleChange} className="w-full p-2 border rounded" rows="3" placeholder="Full address..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 font-semibold mb-2">Google Map Embed URL (src attribute only)</label>
                        <input name="googleMapEmbedUrl" value={company.googleMapEmbedUrl || ''} onChange={handleChange} className="w-full p-2 border rounded" placeholder="https://www.google.com/maps/embed?..." />
                        <p className="text-xs text-gray-500 mt-1">Go to Google Maps -&gt; Share -&gt; Embed a map -&gt; Copy HTML -&gt; Extract only the 'src' URL.</p>
                    </div>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 mt-4">
                    <Save size={18} /> Save Changes
                </button>
            </form>
        </div>
    );
}
