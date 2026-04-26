import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Calendar, Clock, Link2, BookOpen, Trash2, Edit, Plus, Users } from 'lucide-react';

export default function AdminSessionManager() {
    const [sessions, setSessions] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSession, setEditingSession] = useState(null);
    const [formData, setFormData] = useState({
        courseId: '', title: '', date: '', startTime: '',
        meetingLink: '', platform: 'zoom', description: ''
    });

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [sessionsRes, coursesRes] = await Promise.all([
                axios.get(import.meta.env.VITE_API_BASE_URL + '/sessions', authHeader),
                axios.get(import.meta.env.VITE_API_BASE_URL + '/courses', authHeader)
            ]);
            setSessions(sessionsRes.data);
            setCourses(coursesRes.data);
        } catch (error) {
            console.error('Failed to load data:', error);
            alert('Failed to load sessions data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const openCreateModal = () => {
        setEditingSession(null);
        setFormData({ courseId: '', title: '', date: '', startTime: '', meetingLink: '', platform: 'zoom', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (session) => {
        setEditingSession(session);
        setFormData({
            courseId: session.courseId,
            title: session.title,
            date: new Date(session.date).toISOString().split('T')[0],
            startTime: session.startTime,
            meetingLink: session.meetingLink || '',
            platform: session.platform || 'zoom',
            description: session.description || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingSession) {
                await axios.put(`${import.meta.env.VITE_API_BASE_URL}/sessions/${editingSession.id}`, formData, authHeader);
            } else {
                await axios.post(import.meta.env.VITE_API_BASE_URL + '/sessions', formData, authHeader);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            alert(`Failed to ${editingSession ? 'update' : 'create'} session`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to permanently delete this session?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/sessions/${id}`, authHeader);
            setSessions(sessions.filter(s => s.id !== id));
        } catch (error) {
            alert('Failed to delete session');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    if (isLoading) {
        return <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Global Session Control</h2>
                    <p className="text-slate-400 font-medium">Manage all scheduled classes across the platform</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition hover:scale-105 active:scale-95"
                >
                    <Plus size={20} /> Create Global Session
                </button>
            </div>

            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="text-xs uppercase bg-white/5 font-black text-slate-400">
                            <tr>
                                <th className="px-6 py-4">Title / Course</th>
                                <th className="px-6 py-4">Instructor</th>
                                <th className="px-6 py-4">Timing</th>
                                <th className="px-6 py-4">Platform</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {sessions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No active sessions scheduled across the platform.
                                    </td>
                                </tr>
                            ) : (
                                sessions.map(session => (
                                    <tr key={session.id} className="hover:bg-white/5 transition group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-white text-base mb-1">{session.title}</div>
                                            <div className="flex items-center gap-1 text-xs text-blue-400 font-medium">
                                                <BookOpen size={12} /> {session.Course?.title || 'Unknown Course'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                    <Users size={12} />
                                                </div>
                                                <span className="font-medium">{session.instructor?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Calendar size={14} className="text-slate-400" />
                                                {new Date(session.date).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Clock size={14} className="text-slate-400" />
                                                {session.startTime}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-white/5 border border-white/10 rounded uppercase text-[10px] font-black tracking-widest text-slate-300">
                                                {session.platform}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md border text-xs font-bold uppercase ${getStatusColor(session.status)}`}>
                                                {(session.status || 'unknown').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEditModal(session)}
                                                    className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded-lg transition"
                                                    title="Edit Session"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(session.id)}
                                                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition"
                                                    title="Delete Session"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Overlay */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-slate-800 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden relative z-10 shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                <h3 className="text-xl font-bold text-white">
                                    {editingSession ? 'Edit Global Session' : 'Create New Security Session'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Course</label>
                                    <select
                                        name="courseId"
                                        value={formData.courseId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    >
                                        <option value="">Select Course...</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Session Title</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="e.g. Advanced System Architecture"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={formData.date}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Start Time</label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Meeting Link</label>
                                        <div className="relative">
                                            <Link2 className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                            <input
                                                type="url"
                                                name="meetingLink"
                                                value={formData.meetingLink}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                placeholder="https://zoom.us/j/..."
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Platform</label>
                                        <div className="relative">
                                            <Video className="absolute left-3 top-3.5 text-slate-500" size={18} />
                                            <select
                                                name="platform"
                                                value={formData.platform}
                                                onChange={handleInputChange}
                                                className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                                            >
                                                <option value="zoom">Zoom</option>
                                                <option value="meet">Meet</option>
                                                <option value="teams">Teams</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-5 py-2.5 text-slate-300 hover:text-white font-medium transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl disabled:opacity-50 transition shadow-lg shadow-blue-500/20"
                                    >
                                        {isSubmitting ? 'Saving...' : 'Save Session'}
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
