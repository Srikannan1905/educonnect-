import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, CheckCircle, XCircle, Search, User, Clock, Video, Link2 } from 'lucide-react';
import { useToast } from '../ui/Toast';

export default function BookingManager() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [linkForm, setLinkForm] = useState({ platform: 'zoom', meetingLink: '', additionalMessage: '' });
    const { addToast } = useToast();
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchBookings();
    }, []);

    async function fetchBookings() {
        try {
            const token = localStorage.getItem('token');
            // If admin, they can see all. If staff, the backend should ideally filter, but we'll fetch all and they'll be filtered if the API does it.
            // Using the existing getting all bookings route.
            const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Filter locally if staff (though backend filtering is preferred, this adds safety)
            const allBookings = res.data;
            if (user.role === 'staff') {
                setBookings(allBookings.filter(b => b.staffId === user.id));
            } else {
                setBookings(allBookings);
            }
        } catch (err) {
            console.error(err);
            addToast('Failed to load bookings', 'error');
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(id, status) {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/bookings/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast(`Booking ${status}.`, 'success');
            fetchBookings();
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to update status', 'error');
        }
    }

    async function handleSendLink(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_BASE_URL}/bookings/${selectedBookingId}/send-link`, linkForm, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast('Meeting link sent to student successfully.', 'success');
            setIsLinkModalOpen(false);
            setLinkForm({ platform: 'zoom', meetingLink: '', additionalMessage: '' });
        } catch (err) {
            console.error(err);
            addToast(err.response?.data?.message || 'Failed to send meeting link', 'error');
        }
    }

    const filteredBookings = bookings.filter(b =>
        b.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.User?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-200">Booking Management</h2>
                    <p className="text-slate-400 mt-2">Permanent history of all student bookings and demo requests.</p>
                </div>
            </div>

            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-2xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by student, subject, or type..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/10 text-slate-400 text-sm">
                                <th className="p-4 font-semibold">Date</th>
                                <th className="p-4 font-semibold">Student</th>
                                <th className="p-4 font-semibold">Subject / Course</th>
                                <th className="p-4 font-semibold">Type</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading && <tr><td colSpan="6" className="p-8 text-center text-slate-400">Loading bookings...</td></tr>}
                            {!loading && filteredBookings.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No booking history available.</td></tr>}

                            {filteredBookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-white/5 transition group">
                                    <td className="p-4">
                                        <div className="text-slate-200 font-medium">{new Date(booking.date).toLocaleDateString()}</div>
                                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-1">
                                            <Clock size={12} /> {booking.startTime || new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <User size={16} />
                                            </div>
                                            <div>
                                                <div className="text-slate-200 font-bold">{booking.User?.name || 'Unknown User'}</div>
                                                <div className="text-slate-500 text-xs">{booking.User?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-300">
                                        {booking.Course ? booking.Course.title : booking.subject || 'General'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider
                                            ${booking.type === 'hourly' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/20' :
                                                booking.type === 'demo' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}
                                        >
                                            {booking.type}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 flex w-fit items-center gap-1 rounded-full text-[10px] font-black uppercase tracking-wider
                                            ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                                booking.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                                                    'bg-red-500/20 text-red-400'}`}
                                        >
                                            {booking.status === 'confirmed' && <CheckCircle size={12} />}
                                            {booking.status === 'cancelled' && <XCircle size={12} />}
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {booking.status === 'pending' && (
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                                    className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                                    className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition"
                                                    title="Reject"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        )}
                                        {booking.status === 'confirmed' && user.role === 'staff' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedBookingId(booking.id);
                                                    setIsLinkModalOpen(true);
                                                }}
                                                className="p-2 ml-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition opacity-0 group-hover:opacity-100"
                                                title="Send Meeting Link"
                                            >
                                                <Video size={16} />
                                            </button>
                                        )}
                                        {booking.status !== 'pending' && (
                                            <div className="text-slate-500 text-xs italic mt-2">
                                                Resolved
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Send Link Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsLinkModalOpen(false)} />
                    <div className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-md relative z-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5 disabled:opacity-50">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Video size={20} className="text-blue-400" /> Send Meeting Link
                            </h3>
                        </div>
                        <form onSubmit={handleSendLink} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Platform</label>
                                <select
                                    value={linkForm.platform}
                                    onChange={(e) => setLinkForm({ ...linkForm, platform: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="zoom">Zoom</option>
                                    <option value="google_meet">Google Meet</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Meeting URL</label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                    <input
                                        type="url"
                                        required
                                        value={linkForm.meetingLink}
                                        onChange={(e) => setLinkForm({ ...linkForm, meetingLink: e.target.value })}
                                        placeholder="https://..."
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Message (Optional)</label>
                                <textarea
                                    value={linkForm.additionalMessage}
                                    onChange={(e) => setLinkForm({ ...linkForm, additionalMessage: e.target.value })}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
                                    placeholder="Any prerequisites or instructions..."
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsLinkModalOpen(false)} className="px-5 py-2.5 text-slate-400 hover:text-white font-medium transition">
                                    Cancel
                                </button>
                                <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/20">
                                    Send to Student
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
