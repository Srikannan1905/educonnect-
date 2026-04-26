import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, User, Calendar, MessageCircle, ArrowLeft, Layout, CheckCircle, Video, Clock } from 'lucide-react';
import QuizList from '../components/QuizList';
import { motion } from 'framer-motion';
import { NavControls } from '../components/ui/DashCards';

export default function CourseRoom() {
    const { id } = useParams();
    const [booking, setBooking] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                // Here we fetch the booking detail which includes course and instructor
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/bookings/my`); // For demo, we filter from my bookings
                const currentBooking = res.data.find(b => b.id === id || b.courseId === id);
                setBooking(currentBooking);

                if (currentBooking && (currentBooking.courseId || id)) {
                    const cId = currentBooking.courseId || id;
                    try {
                        const sessRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/sessions/course/${cId}`);
                        setSessions(sessRes.data);
                    } catch (e) {
                        console.error('Failed to load course sessions', e);
                    }
                }
            } catch (err) { }
            finally { setLoading(false); }
        };
        fetchCourseData();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Entering Classroom...</div>;
    if (!booking) return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white"><ArrowLeft className="mb-4" /> Course not found.</div>;

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="hidden sm:block">
                        <NavControls />
                    </div>
                    <Link to="/student-dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-500 font-black uppercase tracking-widest text-[10px] transition">
                        Exit to Dashboard
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Course Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-10 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen size={120} /></div>
                            <span className="bg-blue-600/20 text-blue-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Active Level: {booking.Course?.subject || 'Core'}</span>
                            <h1 className="text-4xl font-black text-slate-200 mb-4">{booking.Course?.title}</h1>
                            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-2xl">{booking.Course?.description}</p>

                            <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/5 rounded-2xl text-blue-400"><Calendar size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Enrolled on</p>
                                        <p className="font-bold text-slate-300">{new Date(booking.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/5 rounded-2xl text-green-400"><Layout size={20} /></div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</p>
                                        <p className="font-bold text-slate-300">Basic Phase</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quizzes Section */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-10 rounded-[2.5rem] border border-white/5">
                            <QuizList courseId={booking.courseId || id} />
                        </motion.div>
                    </div>

                    {/* Right Column: Instructor & Resources */}
                    <div className="space-y-8">
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-[2.5rem] border border-white/5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Subject Expert</h3>
                            <div className="flex items-center gap-4 mb-6">
                                {booking.instructor?.profileImage || booking.Course?.instructor?.profileImage ? (
                                    <img src={`${import.meta.env.VITE_API_URL}${booking.instructor?.profileImage || booking.Course?.instructor?.profileImage}`} className="w-16 h-16 rounded-2xl object-cover" />
                                ) : (
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500"><User size={32} /></div>
                                )}
                                <div>
                                    <h4 className="font-black text-slate-200">{booking.instructor?.name || booking.Course?.instructor?.name || 'Assigned Tutor'}</h4>
                                    <p className="text-xs font-bold text-blue-500">{booking.instructor?.qualification || booking.Course?.instructor?.qualification || 'Certified Faculty'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    const email = booking.instructor?.email || booking.Course?.instructor?.email;
                                    if (email) {
                                        window.location.href = `mailto:${email}?subject=Question regarding ${booking.Course?.title || 'Course'}`;
                                    } else {
                                        alert('Instructor contact information is currently unavailable.');
                                    }
                                }}
                                className="w-full py-4 bg-white/5 rounded-2xl text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/10 transition border border-white/5"
                            >
                                <MessageCircle size={16} /> Contact Instructor
                            </button>
                        </motion.div>

                        {/* Direct Booking Meeting Link (If sent by tutor) */}
                        {booking.meetingLink && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-[2.5rem] border border-blue-500/20 mb-8 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-200 mb-2">Join Your Class Now</h3>
                                    <p className="text-sm text-slate-400">Your instructor has opened the meeting room. Click to join via {booking.platform || 'video chat'}.</p>
                                </div>
                                <a
                                    href={booking.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2 uppercase tracking-wide"
                                >
                                    Join Meeting <Video size={20} />
                                </a>
                            </motion.div>
                        )}

                        {/* Live Sessions Pane */}
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-[2.5rem] border border-white/5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Video size={16} className="text-blue-400" /> Live Classes & Meetings
                            </h3>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {sessions.length === 0 ? (
                                    <p className="text-slate-400 text-sm italic py-4">No upcoming live sessions scheduled yet.</p>
                                ) : (
                                    sessions.map(session => (
                                        <div key={session.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-200">{session.title}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider ${session.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : session.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            <div className="text-slate-400 text-xs flex items-center gap-3 mb-4">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(session.date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {session.startTime}</span>
                                            </div>
                                            {session.meetingLink && session.status !== 'completed' && (
                                                <a
                                                    href={session.meetingLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
                                                >
                                                    Join Class <Video size={14} />
                                                </a>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-[2.5rem] border border-white/5">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Course Material</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-50">
                                    <BookOpen size={18} />
                                    <span className="text-xs font-bold">Session Notes (Coming Soon)</span>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-dashed border-white/10 opacity-50">
                                    <CheckCircle size={18} />
                                    <span className="text-xs font-bold">Recorded Sessions (Coming Soon)</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
