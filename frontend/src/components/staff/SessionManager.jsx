import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, Link as LinkIcon, Plus, Video, Mail, Trash2, CheckCircle, Pencil } from 'lucide-react';

export default function SessionManager({ user }) {
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        courseId: '',
        title: '',
        date: '',
        startTime: '',
        meetingLink: '',
        platform: 'zoom',
        description: '',
        notifyStudents: true
    });

    async function fetchData() {
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };

            let url = '/sessions/staff';
            if (user?.role === 'student') url = '/sessions/student';

            const [sessionsRes, coursesRes] = await Promise.all([
                axios.get(url, authHeader),
                axios.get('/courses', authHeader)
            ]);

            if (Array.isArray(sessionsRes.data)) setSessions(sessionsRes.data);
            if (Array.isArray(coursesRes.data)) {
                setCourses(coursesRes.data);
            }
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch session data");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    async function handleSaveSession(e) {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const authHeader = { headers: { Authorization: `Bearer ${token}` } };

            if (isEditing) {
                await axios.put(`/sessions/${currentSessionId}`, formData, authHeader);
                alert('Session updated successfully!');
            } else {
                await axios.post('/sessions', formData, authHeader);
                alert('Session scheduled and notifications sent!');
            }

            closeModal();
            fetchData();
        } catch (error) {
            console.error('Operation failed', error);
            alert(isEditing ? 'Failed to update session' : 'Failed to schedule session');
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setFormData({
            courseId: '', title: '', date: '', startTime: '', meetingLink: '',
            platform: 'zoom', description: '', notifyStudents: true
        });
        setIsModalOpen(true);
    };

    const openEditModal = (session) => {
        setIsEditing(true);
        setCurrentSessionId(session.id);
        setFormData({
            courseId: session.courseId,
            title: session.title,
            date: session.date,
            startTime: session.startTime,
            meetingLink: session.meetingLink || '',
            platform: session.platform || 'zoom',
            description: session.description || '',
            notifyStudents: false
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsEditing(false);
        setCurrentSessionId(null);
    };

    async function handleDeleteSession(sessionId) {
        if (!window.confirm('Are you sure you want to permanently remove this scheduled class?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/sessions/${sessionId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch {
            alert('Failed to delete session');
        }
    };

    async function handleSessionStatus(sessionId, action) {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/sessions/${sessionId}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(); // Refresh list to update status
        } catch (err) {
            console.error(`Failed to ${action} session`, err);
            alert(`Could not ${action} session. Please try again.`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-200">Class Schedule</h2>
                {user?.role !== 'student' && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg"
                    >
                        <Plus size={20} /> Schedule New Class
                    </button>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.length === 0 ? (
                        <div className="col-span-full bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-12 rounded-xl shadow text-center text-slate-400">
                            <CalendarIcon size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-xl">No classes scheduled yet.</p>
                            {user?.role !== 'student' && (
                                <button onClick={openCreateModal} className="text-blue-600 font-bold mt-2 hover:underline">Schedule your first session</button>
                            )}
                        </div>
                    ) : (
                        sessions.map(session => (
                            <div key={session.id} className={`bg-[#1e293b]/80 backdrop-blur-xl border ${session.status === 'in_progress' ? 'border-emerald-500/50 shadow-emerald-500/20' : 'border-white/10'} shadow-2xl rounded-xl shadow-md border-t-4 ${session.status === 'in_progress' ? 'border-t-emerald-500' : 'border-t-blue-500'} p-6 hover:shadow-lg transition relative overflow-hidden`}>
                                {session.status === 'in_progress' && (
                                    <div className="absolute top-0 right-0">
                                        <div className="bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-bl-lg animate-pulse flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                            LIVE NOW
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-slate-200">{session.title}</h3>
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${session.platform === 'zoom' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                        {session.platform.replace('_', ' ')}
                                    </span>
                                </div>
                                <p className="text-blue-600 font-semibold mb-4 flex items-center gap-2">
                                    <CheckCircle size={16} /> {session.Course?.title}
                                </p>
                                <div className="space-y-2 text-slate-400 mb-6">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon size={18} /> {new Date(session.date).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={18} /> {session.startTime}
                                    </div>
                                    {session.meetingLink && (
                                        <div className="flex items-center gap-2 text-blue-600 font-medium truncate">
                                            <LinkIcon size={18} />
                                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">Join Meeting</a>
                                        </div>
                                    )}
                                </div>
                                {session.status === 'scheduled' && (
                                    <div className="flex gap-2 mt-4">
                                        {user?.role !== 'student' && (
                                            <>
                                                <button
                                                    onClick={() => handleSessionStatus(session.id, 'start')}
                                                    className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                                                >
                                                    <Video size={18} /> Start
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(session)}
                                                    className="p-2 bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition border border-white/5"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSession(session.id)}
                                                    className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition border border-white/5"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                        {user?.role === 'student' && (
                                            <div className="w-full bg-blue-500/10 text-blue-400 font-bold py-2 rounded-lg text-center text-xs uppercase tracking-widest border border-blue-500/20">
                                                Awaiting Commencement
                                            </div>
                                        )}
                                    </div>
                                )}
                                {session.status === 'in_progress' && (
                                    <div className="mt-4">
                                        {user?.role === 'student' ? (
                                            <a
                                                href={session.meetingLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl transition flex items-center justify-center gap-3 shadow-xl shadow-blue-500/30 animate-pulse border-2 border-white/20"
                                            >
                                                <Video size={22} className="animate-bounce" />
                                                <span className="uppercase tracking-widest text-sm">Join Live Session Now</span>
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => handleSessionStatus(session.id, 'end')}
                                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle size={18} /> End Session
                                            </button>
                                        )}
                                    </div>
                                )}
                                {session.status === 'completed' && (
                                    <div className="w-full bg-white/10 text-slate-400 font-bold py-2 rounded-lg text-center flex items-center justify-center gap-2 mt-4">
                                        <CheckCircle size={18} /> Session Completed
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
                            <h3 className="text-xl font-bold">{isEditing ? 'Update Scheduled Class' : 'Schedule New Class Session'}</h3>
                            <button onClick={closeModal} className="hover:bg-blue-800 p-1 rounded-full"><Plus size={24} className="rotate-45" /></button>
                        </div>
                        <form onSubmit={handleSaveSession} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-slate-300 font-semibold mb-2">Select Course</label>
                                <select
                                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-[#172033] text-white border-white/10"
                                    value={formData.courseId}
                                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                    required
                                >
                                    <option value="">-- Select a Course --</option>
                                    {courses.map(course => <option key={course.id} value={course.id}>{course.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-300 font-semibold mb-2">Session Title</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-[#172033] text-white border-white/10"
                                    placeholder="e.g., Introduction to Physics"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-2">Date</label>
                                    <input
                                        type="date"
                                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-[#172033] text-white border-white/10"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-300 font-semibold mb-2">Start Time</label>
                                    <input
                                        type="time"
                                        className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-[#172033] text-white border-white/10"
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-300 font-semibold mb-2">Meeting Platform</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, platform: 'zoom' })}
                                        className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-bold ${formData.platform === 'zoom' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-transparent border-white/10'}`}
                                    >
                                        <Video size={20} /> Zoom
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, platform: 'google_meet' })}
                                        className={`p-3 rounded-lg border flex items-center justify-center gap-2 font-bold ${formData.platform === 'google_meet' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-transparent border-white/10'}`}
                                    >
                                        <Video size={20} /> Google Meet
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-slate-300 font-semibold mb-2">Meeting Link</label>
                                <input
                                    type="url"
                                    className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-[#172033] text-white border-white/10"
                                    placeholder="https://zoom.us/j/..."
                                    value={formData.meetingLink}
                                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="notify"
                                    checked={formData.notifyStudents}
                                    onChange={(e) => setFormData({ ...formData, notifyStudents: e.target.checked })}
                                    className="w-5 h-5"
                                />
                                <label htmlFor="notify" className="text-blue-300 font-semibold flex items-center gap-2">
                                    <Mail size={18} /> Notify all enrolled students via email
                                </label>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-xl text-lg mt-4"
                            >
                                {isEditing ? 'Sync Updates' : 'Schedule Class'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
