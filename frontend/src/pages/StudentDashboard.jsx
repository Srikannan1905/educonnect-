import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, CreditCard, User, Menu, X, LogOut, Edit2, Search, Star, MessageCircle, Clock, CheckCircle, Info, Bell, ArrowRight, Award, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileEditModal from '../components/ProfileEditModal';
import Gradebook from '../components/student/Gradebook';
import { NavControls } from '../components/ui/DashCards';

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('user')) || null;
        } catch {
            return null;
        }
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [instructors, setInstructors] = useState([]);
    const [activities, setActivities] = useState([]);
    const [selectedTutor, setSelectedTutor] = useState(null);
    const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('09:00');
    const [bookingLoading, setBookingLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    async function fetchData() {
        try {
            if (activeTab === 'bookings' || activeTab === 'courses') {
                const res = await axios.get('/bookings/my');
                if (Array.isArray(res.data)) {
                    setBookings(res.data);
                }
            } else if (activeTab === 'payments') {
                const res = await axios.get('/payments/my');
                if (Array.isArray(res.data)) {
                    setPayments(res.data);
                }
            } else if (activeTab === 'browse-tutors') {
                const res = await axios.get('/users/public/instructors');
                setInstructors(res.data);
            } else if (activeTab === 'activity-feed') {
                const token = localStorage.getItem('token');
                const res = await axios.get('/users/activities', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setActivities(res.data);
            }
        } catch (err) {
            console.error('Fetch Error:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    async function bookTutorDemo() {
        if (!bookingDate) {
            alert('Please select a preferred date for the demo.');
            return;
        }
        setBookingLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('/bookings/demo', {
                staffId: selectedTutor.id,
                subject: selectedTutor.subjects?.split(',')[0]?.trim() || 'General',
                date: bookingDate,
                startTime: bookingTime
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`${res.data.message}`);
            setIsBookingModalOpen(false);
            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to book demo');
        } finally {
            setBookingLoading(false);
        }
    };

    async function bookHourlyClass(tutor) {
        if (!bookingDate) {
            alert('Please select a preferred date for the hourly class before clicking Book.');
            return;
        }
        setBookingLoading(true);
        try {
            const token = localStorage.getItem('token');
            const subject = tutor.subjects?.split(',')[0]?.trim() || 'Hourly Subject';
            const res = await axios.post('/bookings/hourly', {
                staffId: tutor.id,
                subject: subject,
                date: bookingDate,
                startTime: bookingTime
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Send WhatsApp Alert
            // Format phone number to avoid missing country code (assuming India +91 if none provided for this demo)
            let phone = tutor.phone || '917871444323';
            if (!phone.startsWith('+') && phone.length === 10) phone = '91' + phone;

            const message = encodeURIComponent(`Hello ${tutor.name}, I am ${user.name} and I just requested an hourly class for ${subject} on ${bookingDate}. Please check your dashboard to approve!`);
            const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`;

            alert(res.data.message + ' You will now be redirected to WhatsApp to notify the tutor.');
            window.open(whatsappUrl, '_blank');

            fetchData();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to request hourly class');
        } finally {
            setBookingLoading(false);
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Redundant as modal does it, but safe sync
    };

    if (!user) return (
        <div className="flex h-screen items-center justify-center p-20 bg-[#0b0f19]">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent flex relative">
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentUser={user}
                onUpdate={handleUserUpdate}
            />

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl text-blue-300 p-2 rounded-full shadow-lg border border-white/5"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                w-64 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-xl min-h-screen p-4 flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col items-center mb-8 pt-8 relative group">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 overflow-hidden border-2 border-blue-100 relative">
                        {user?.profileImage ? (
                            <img src={`${import.meta.env.VITE_API_URL}${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-600">
                                <User size={40} />
                            </div>
                        )}
                    </div>

                    <h2 className="font-bold text-lg text-slate-200">{user?.name}</h2>
                    <p className="text-slate-400 text-xs mb-2">{user?.email}</p>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-blue-400 text-xs font-semibold flex items-center gap-1 hover:bg-blue-500/10 px-3 py-1 rounded-full transition"
                    >
                        <Edit2 size={12} /> Edit Profile
                    </button>
                </div>

                <nav className="space-y-2 flex-grow">
                    <button onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'bookings' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/10'}`}>
                        <Calendar size={20} /> My Bookings
                    </button>
                    <button onClick={() => { setActiveTab('courses'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'courses' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/10'}`}>
                        <BookOpen size={20} /> My Courses
                    </button>
                    <button onClick={() => { setActiveTab('gradebook'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'gradebook' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/10'}`}>
                        <Award size={20} /> Gradebook
                    </button>
                    <button onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'payments' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/10'}`}>
                        <CreditCard size={20} /> Payment History
                    </button>
                    <button onClick={() => { setActiveTab('browse-tutors'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'browse-tutors' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:bg-white/10'}`}>
                        <Search size={20} /> Browse Tutors
                    </button>
                    <button onClick={() => { setActiveTab('activity-feed'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'activity-feed' ? 'bg-purple-50 text-purple-600' : 'text-slate-400 hover:bg-white/10'}`}>
                        <Bell size={20} /> Activity Feed
                    </button>
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-lg w-full transition font-medium">
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 pb-32 transition-all duration-300">
                <div className="max-w-4xl mx-auto mt-12 lg:mt-0">
                    <div className="flex items-center gap-6 mb-8">
                        <NavControls />
                        <h1 className="text-3xl font-bold text-slate-200 capitalize">{activeTab.replace('-', ' ')}</h1>
                    </div>

                    {activeTab === 'bookings' && (
                        <div className="space-y-4">
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-blue-500 text-white p-6 rounded-xl shadow-md">
                                    <div className="text-3xl font-bold">{(Array.isArray(bookings) ? bookings : []).filter(b => b.type === 'demo').length}</div>
                                    <div className="text-blue-100 text-sm">Demo Classes</div>
                                </div>
                                <div className="bg-green-500 text-white p-6 rounded-xl shadow-md">
                                    <div className="text-3xl font-bold">{(Array.isArray(bookings) ? bookings : []).filter(b => b.type === 'course').length}</div>
                                    <div className="text-green-100 text-sm">Enrolled Courses</div>
                                </div>
                            </div>

                            {(Array.isArray(bookings) ? bookings : []).filter(b => b.type === 'demo').length === 0 && <p className="text-slate-400 text-center py-8">No demo bookings found.</p>}
                            {(Array.isArray(bookings) ? bookings : []).filter(b => b.type === 'demo').map(booking => (
                                <div key={booking.id} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-6 rounded-xl shadow-sm border border-white/5 hover:shadow-md transition flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-200">
                                                {booking.type === 'demo' ? `Demo with ${booking.instructor?.name || 'Tutor'}` : booking.Course?.title}
                                            </h3>
                                            <p className="text-slate-400 text-sm">
                                                {booking.type === 'demo' ? `${booking.subject || 'General'} • 1 Hour Session` : 'Course Enrollment'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <div className="flex gap-2 mb-1">
                                            {booking.isFree && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Free</span>}
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">{booking.status}</span>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-2">{new Date(booking.date).toLocaleDateString()}</p>

                                        {booking.meetingLink && (
                                            <a
                                                href={booking.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-2 text-xs font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition"
                                            >
                                                Join Link <Video size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-black text-slate-200">My Learning Board</h2>
                                <p className="text-sm text-slate-400 font-bold">{(Array.isArray(bookings) ? bookings : []).filter(b => b.type === 'course').length} Active Courses</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {(Array.isArray(bookings) ? bookings : []).filter(b => b.type === 'course').length === 0 && (
                                    <div className="col-span-full text-center py-12 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl border-2 border-dashed border-white/5">
                                        <p className="text-slate-400 italic mb-6">"The journey of a thousand miles begins with a single step." Book your first course today!</p>
                                        <button
                                            onClick={() => navigate('/courses')}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition flex items-center gap-2 mx-auto"
                                        >
                                            <BookOpen size={18} /> Browse Courses
                                        </button>
                                    </div>
                                )}
                                {(Array.isArray(bookings) ? bookings : []).filter(b => b.type === 'course').map(booking => {
                                    const isExpired = booking.expiresAt && new Date(booking.expiresAt) < new Date();

                                    return (
                                        <div key={booking.id} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2rem] shadow-sm border border-white/5 group hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col relative">
                                            <div className="h-3 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                                            <div className="p-8 flex-grow">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:scale-110 transition duration-500">
                                                        <BookOpen size={28} />
                                                    </div>
                                                </div>

                                                <h3 className="font-black text-2xl text-slate-200 mb-3 group-hover:text-blue-600 transition">{booking.Course?.title}</h3>
                                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">Continue your educational journey and master {booking.Course?.subject || 'the course material'} with our expert-led sessions.</p>

                                                <div className="space-y-4 mb-8">
                                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-gray-400">
                                                        <span>Progress</span>
                                                        <span className="text-blue-600">Locked</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-500 w-[15%] rounded-full shadow-lg shadow-blue-200"></div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 p-4 bg-transparent rounded-2xl border border-gray-100/50 mb-6">
                                                    {booking.instructor?.profileImage ? (
                                                        <img src={`${import.meta.env.VITE_API_URL}${booking.instructor.profileImage}`} className="w-10 h-10 rounded-xl object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500"><User size={20} /></div>
                                                    )}
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Instructor</p>
                                                        <p className="text-sm font-bold text-slate-300">{booking.instructor?.name || 'Assigned Faculty'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-8 pt-0 mt-auto">
                                                <button
                                                    disabled={isExpired}
                                                    onClick={() => navigate(`/course/${booking.id}`)}
                                                    className={`w-full py-5 rounded-2xl font-black text-sm transition shadow-xl flex items-center justify-center gap-2 ${isExpired ? 'bg-white/10 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-blue-600 shadow-gray-200'}`}
                                                >
                                                    {isExpired ? 'Access Expired' : 'Enter Classroom'} <ArrowRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl shadow-sm border border-white/5 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-transparent border-b border-white/10">
                                        <tr>
                                            <th className="p-4 text-sm font-semibold text-slate-400">Date</th>
                                            <th className="p-4 text-sm font-semibold text-slate-400">Course</th>
                                            <th className="p-4 text-sm font-semibold text-slate-400">Transaction ID</th>
                                            <th className="p-4 text-sm font-semibold text-slate-400">Amount</th>
                                            <th className="p-4 text-sm font-semibold text-slate-400">Status</th>
                                            <th className="p-4 text-sm font-semibold text-slate-400">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(Array.isArray(payments) ? payments : []).length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-400">No payment history found.</td></tr>}
                                        {(Array.isArray(payments) ? payments : []).map(payment => (
                                            <tr key={payment.id} className="border-b border-white/10 border-white/10 last:border-0 hover:bg-white/10">
                                                <td className="p-4 text-sm font-medium text-slate-400">
                                                    {new Date(payment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    <div className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="p-4 font-medium text-slate-200">{payment.Course?.title}</td>
                                                <td className="p-4 font-mono text-xs text-slate-400">{payment.transactionId}</td>
                                                <td className="p-4 font-bold text-slate-200">₹{parseFloat(payment.amount).toFixed(2)}</td>
                                                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold capitalize">{payment.status}</span></td>
                                                <td className="p-4">
                                                    <button
                                                        className="text-blue-400 hover:text-blue-300 text-xs font-semibold border border-blue-500/30 px-2 py-1 rounded hover:bg-blue-500/20 transition"
                                                        onClick={() => window.open(`/invoice/${payment.id}`, '_blank')}
                                                    >
                                                        Invoice
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity-feed' && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-slate-200 mb-6 font-primary uppercase tracking-tight">Your Academic Activity</h2>
                            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] shadow-xl border border-white/5 overflow-hidden">
                                <div className="divide-y divide-white/5">
                                    {activities.length === 0 ? (
                                        <div className="p-16 text-center text-gray-400 italic">
                                            <Bell className="mx-auto mb-4 opacity-20" size={48} />
                                            No recent activity logged.
                                        </div>
                                    ) : activities.map(act => (
                                        <div key={act.id} className="p-8 hover:bg-gray-50/80 transition flex gap-6 items-start group">
                                            <div className={`p-4 rounded-2xl shadow-sm group-hover:scale-110 transition duration-500 ${act.action === 'session_started' ? 'bg-green-100 text-green-600' :
                                                act.action === 'session_ended' ? 'bg-orange-100 text-orange-600' :
                                                    act.action === 'booking_created' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'
                                                }`}>
                                                <Bell size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-black text-slate-200 capitalize text-lg leading-none">{act.action.replace('_', ' ')}</h4>
                                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{new Date(act.createdAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-slate-400 font-medium leading-relaxed">{act.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'gradebook' && (
                        <Gradebook />
                    )}

                    {activeTab === 'browse-tutors' && (
                        <div className="space-y-6">
                            <div className="relative mb-8">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by subject or tutor name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl border border-white/5 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 transition outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {instructors.filter(inst => inst.name.toLowerCase().includes(searchQuery.toLowerCase()) || inst.subjects?.toLowerCase().includes(searchQuery.toLowerCase())).map(instructor => {
                                    const hasFreeDemo = !bookings.some(b => b.staffId === instructor.id && b.type === 'demo');

                                    return (
                                        <div key={instructor.id} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-6 shadow-sm border border-white/5 hover:shadow-xl transition flex flex-col group relative overflow-hidden">
                                            <div className="flex gap-4 mb-6">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/5 shadow-inner">
                                                    {instructor.profileImage ? (
                                                        <img src={`${import.meta.env.VITE_API_URL}${instructor.profileImage}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-400">
                                                            <User size={32} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-black text-xl text-slate-200">{instructor.name}</h3>
                                                        {hasFreeDemo && (
                                                            <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Free Demo Avail</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-bold text-blue-600">{instructor.qualification || 'Certified Instructor'}</p>
                                                    <div className="flex gap-1 mt-2">
                                                        {instructor.subjects?.split(',').map((sub, i) => (
                                                            <span key={i} className="text-[10px] bg-transparent text-slate-400 px-2 py-0.5 rounded-md border border-white/5">{sub.trim()}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-slate-400 text-sm line-clamp-3 mb-6 italic">
                                                "{instructor.bio || 'Passionate educator committed to student success and academic excellence through personalized teaching methods.'}"
                                            </p>

                                            <button
                                                onClick={() => { setSelectedTutor(instructor); setIsBookingModalOpen(true); }}
                                                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
                                            >
                                                Book Session <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main >

            {/* Booking Modal */}
            {
                isBookingModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-blue-900/60 backdrop-blur-sm" onClick={() => setIsBookingModalOpen(false)}></div>
                        <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white relative">
                                <button onClick={() => setIsBookingModalOpen(false)} className="absolute top-6 right-6 hover:bg-white/10 p-2 rounded-full transition">
                                    <X size={24} />
                                </button>
                                <h2 className="text-3xl font-black mb-2">Reserve Demo</h2>
                                <p className="text-blue-100 text-sm">Experience {selectedTutor?.name}'s unique teaching style.</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex gap-4">
                                    <div className="text-orange-500 mt-0.5"><Info size={20} /></div>
                                    <div>
                                        <h4 className="font-bold text-orange-800 text-sm">Selection Policy</h4>
                                        <p className="text-orange-700 text-xs">Each student is entitled to **one free demo** per instructor. Perfect for evaluating fit before enrollment.</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Preferred Date</label>
                                            <input
                                                type="date"
                                                value={bookingDate}
                                                onChange={(e) => setBookingDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full p-4 bg-transparent border border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Class Time</label>
                                            <input
                                                type="time"
                                                value={bookingTime}
                                                onChange={(e) => setBookingTime(e.target.value)}
                                                className="w-full p-4 bg-transparent border border-white/5 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <button
                                            onClick={bookTutorDemo}
                                            disabled={bookingLoading}
                                            className="w-full py-4 bg-blue-600 text-white rounded-[1.5rem] font-black hover:bg-blue-700 transition shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                                        >
                                            {bookingLoading ? 'Processing...' : bookings.some(b => b.staffId === selectedTutor?.id && b.type === 'demo') ? 'Demo Already Claimed' : 'Confirm Free Demo'}
                                        </button>
                                        <button
                                            onClick={() => bookHourlyClass(selectedTutor)}
                                            disabled={bookingLoading}
                                            className="w-full py-4 bg-green-500 text-white rounded-[1.5rem] font-black hover:bg-green-600 transition shadow-xl shadow-green-100 flex items-center justify-center gap-2"
                                        >
                                            {bookingLoading ? 'Processing...' : 'Request Hourly Paid Class (WhatsApp)'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Overlay */}
            {
                isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    ></div>
                )
            }
        </div >
    );
}
