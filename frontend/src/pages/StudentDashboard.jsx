import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, CreditCard, User, Menu, X, LogOut, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProfileEditModal from '../components/ProfileEditModal';

export default function StudentDashboard() {
    const [activeTab, setActiveTab] = useState('bookings');
    const [bookings, setBookings] = useState([]);
    const [payments, setPayments] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            if (activeTab === 'bookings') {
                const res = await axios.get('/bookings/my');
                setBookings(res.data);
            } else if (activeTab === 'payments') {
                const res = await axios.get('/payments/my');
                setPayments(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleUserUpdate = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser)); // Redundant as modal does it, but safe sync
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
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-4 right-4 z-50 bg-white text-blue-900 p-2 rounded-full shadow-lg border border-gray-100"
            >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                w-64 bg-white shadow-xl min-h-screen p-4 flex flex-col fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="flex flex-col items-center mb-8 pt-8 relative group">
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-3 overflow-hidden border-2 border-blue-100 relative">
                        {user.profileImage ? (
                            <img src={`http://localhost:5000${user.profileImage}`} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="bg-blue-100 w-full h-full flex items-center justify-center text-blue-600">
                                <User size={40} />
                            </div>
                        )}
                    </div>

                    <h2 className="font-bold text-lg text-gray-800">{user?.name}</h2>
                    <p className="text-gray-500 text-xs mb-2">{user?.email}</p>

                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="text-blue-600 text-xs font-semibold flex items-center gap-1 hover:bg-blue-50 px-3 py-1 rounded-full transition"
                    >
                        <Edit2 size={12} /> Edit Profile
                    </button>
                </div>

                <nav className="space-y-2 flex-grow">
                    <button onClick={() => { setActiveTab('bookings'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <Calendar size={20} /> My Bookings
                    </button>
                    <button onClick={() => { setActiveTab('courses'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'courses' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <BookOpen size={20} /> My Courses
                    </button>
                    <button onClick={() => { setActiveTab('payments'); setIsSidebarOpen(false); }} className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition font-medium ${activeTab === 'payments' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                        <CreditCard size={20} /> Payment History
                    </button>
                </nav>

                <button onClick={handleLogout} className="mt-auto flex items-center gap-2 text-red-500 hover:bg-red-50 p-3 rounded-lg w-full transition font-medium">
                    <LogOut size={20} /> Logout
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-4 md:p-8 transition-all duration-300">
                <div className="max-w-4xl mx-auto mt-12 lg:mt-0">
                    <h1 className="text-3xl font-bold mb-8 text-gray-800 capitalize">{activeTab.replace('-', ' ')}</h1>

                    {activeTab === 'bookings' && (
                        <div className="space-y-4">
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-blue-500 text-white p-6 rounded-xl shadow-md">
                                    <div className="text-3xl font-bold">{bookings.filter(b => b.type === 'demo').length}</div>
                                    <div className="text-blue-100 text-sm">Demo Classes</div>
                                </div>
                                <div className="bg-green-500 text-white p-6 rounded-xl shadow-md">
                                    <div className="text-3xl font-bold">{bookings.filter(b => b.type === 'course').length}</div>
                                    <div className="text-green-100 text-sm">Enrolled Courses</div>
                                </div>
                            </div>

                            {bookings.filter(b => b.type === 'demo').length === 0 && <p className="text-gray-500 text-center py-8">No demo bookings found.</p>}
                            {bookings.filter(b => b.type === 'demo').map(booking => (
                                <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col sm:flex-row justify-between items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-800">{booking.Course?.title}</h3>
                                            <p className="text-gray-500 text-sm">Demo Class • 1 Hour Session</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase mb-1">{booking.status}</span>
                                        <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="grid gap-6">
                            {bookings.filter(b => b.type === 'course').length === 0 && <p className="text-gray-500 text-center py-8">You haven't purchased any courses yet.</p>}
                            {bookings.filter(b => b.type === 'course').map(booking => {
                                const isExpired = booking.expiresAt && new Date(booking.expiresAt) < new Date();
                                const expiryDate = booking.expiresAt ? new Date(booking.expiresAt).toLocaleString() : 'Lifetime Access';

                                return (
                                    <div key={booking.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 group hover:shadow-lg transition">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-xl text-gray-800">{booking.Course?.title}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isExpired ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {isExpired ? 'Expired' : 'Enrolled'}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 mb-2 text-sm">Master this subject with our comprehensive curriculum.</p>
                                        <p className="text-xs text-orange-600 font-semibold mb-6">
                                            Access Valid Until: {expiryDate}
                                        </p>
                                        <button
                                            disabled={isExpired}
                                            className={`w-full py-3 rounded-lg font-semibold transition ${isExpired ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                        >
                                            {isExpired ? 'Access Expired' : 'Access Course Content'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {activeTab === 'payments' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Date</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Course</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Transaction ID</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Amount</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Status</th>
                                            <th className="p-4 text-sm font-semibold text-gray-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-500">No payment history found.</td></tr>}
                                        {payments.map(payment => (
                                            <tr key={payment.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="p-4 text-sm font-medium text-gray-600">
                                                    {new Date(payment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                                    <div className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                                </td>
                                                <td className="p-4 font-medium text-gray-800">{payment.Course?.title}</td>
                                                <td className="p-4 font-mono text-xs text-gray-500">{payment.transactionId}</td>
                                                <td className="p-4 font-bold text-gray-800">₹{parseFloat(payment.amount).toFixed(2)}</td>
                                                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold capitalize">{payment.status}</span></td>
                                                <td className="p-4">
                                                    <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold border border-blue-200 px-2 py-1 rounded hover:bg-blue-50 transition" onClick={() => alert("Invoice download coming soon!")}>
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
                </div>
            </main>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
