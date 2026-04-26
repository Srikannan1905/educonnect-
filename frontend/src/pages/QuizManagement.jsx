import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, Clock, CheckCircle2, AlertCircle, Search, BookOpen, BarChart3, ChevronRight, Share2, ExternalLink, Trophy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { NavControls } from '../components/ui/DashCards';
import QuizLeaderboard from '../components/shared/QuizLeaderboard';

export default function QuizManagement() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuizForLeaderboard, setSelectedQuizForLeaderboard] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const endpoint = user.role === 'student' ? '/quizzes/student/my' : '/quizzes/staff/my';
            const res = await axios.get(endpoint);
            setQuizzes(res.data);
        } catch (err) {
            console.error("Failed to fetch quizzes", err);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = (quizId) => {
        const shareUrl = `${window.location.origin}/quiz/${quizId}`;
        navigator.clipboard.writeText(shareUrl);
        alert("Assessment link copied to clipboard! Share this with your students.");
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this assessment? All student results will be lost.")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/quizzes/${id}`);
            setQuizzes(quizzes.filter(q => q.id !== id));
        } catch (err) {
            alert("Failed to delete quiz");
        }
    };

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.Course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <NavControls />
                        <div>
                            <h1 className="text-4xl font-black text-slate-200 mb-2">Assessment Hub</h1>
                            <p className="text-slate-400 font-medium">Design and manage professional assessments for your courses.</p>
                        </div>
                    </div>
                    {JSON.parse(localStorage.getItem('user'))?.role !== 'student' && (
                        <button
                            onClick={() => navigate('/dashboard/quiz/new')}
                            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 active:scale-95"
                        >
                            <Plus size={18} /> Create New Assessment
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                        <div className="p-4 bg-blue-500/20 rounded-2xl text-blue-400"><BookOpen size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Exams</p>
                            <p className="text-2xl font-black text-slate-200">{quizzes.length}</p>
                        </div>
                    </div>
                    <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                        <div className="p-4 bg-emerald-500/20 rounded-2xl text-emerald-400"><CheckCircle2 size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Status</p>
                            <p className="text-2xl font-black text-slate-200">{quizzes.filter(q => q.isActive).length}</p>
                        </div>
                    </div>
                    <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                        <div className="p-4 bg-purple-500/20 rounded-2xl text-purple-400"><BarChart3 size={24} /></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
                            <p className="text-2xl font-black text-slate-200">High</p>
                        </div>
                    </div>
                </div>

                <div className="relative mb-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Filter assessments by title or course..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-[#1e293b]/50 border border-white/10 rounded-[1.5rem] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredQuizzes.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-[#1e293b]/30 rounded-[2.5rem] border border-dashed border-white/10">
                            <AlertCircle className="mx-auto mb-4 opacity-20 text-slate-400" size={64} />
                            <p className="text-slate-500 font-bold">No assessments found. Start by creating your first one!</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredQuizzes.map((quiz) => (
                                <motion.div
                                    layout
                                    key={quiz.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[2rem] group hover:bg-[#1e293b] transition flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                                >
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">{quiz.Course?.title || 'General'}</span>
                                            <span className="text-[10px] font-black bg-slate-500/10 text-slate-400 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                                <Clock size={10} /> {quiz.timeLimit} Min
                                            </span>
                                            {JSON.parse(localStorage.getItem('user'))?.role === 'admin' && (
                                                <span className="text-[10px] font-black bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                                    Author: {quiz.instructor?.name || 'Academic System'}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-2xl font-black text-slate-200 group-hover:text-blue-400 transition mb-2">{quiz.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-1 max-w-xl">{quiz.description || 'Professional assessment for student evaluation.'}</p>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        {JSON.parse(localStorage.getItem('user'))?.role === 'student' ? (
                                            quiz.completed ? (
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score</p>
                                                        <p className={`text-sm font-black ${quiz.result?.passed ? 'text-emerald-500' : 'text-red-500'}`}>{quiz.result?.score} / {quiz.result?.totalPoints}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => setSelectedQuizForLeaderboard(quiz)}
                                                        className="px-6 py-4 bg-yellow-500/10 text-yellow-500 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 hover:text-white transition"
                                                    >
                                                        Standings
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/quiz/${quiz.id}`)}
                                                        className="px-6 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition"
                                                    >
                                                        Review
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => navigate(`/quiz/${quiz.id}`)}
                                                    className="w-full md:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                                                >
                                                    <ExternalLink size={14} /> Start Assessment
                                                </button>
                                            )
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleShare(quiz.id)}
                                                    className="flex-1 md:flex-none p-4 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-2xl transition"
                                                    title="Share Assessment"
                                                >
                                                    <Share2 size={20} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/dashboard/quiz/edit/${quiz.id}`)}
                                                    className="flex-1 md:flex-none p-4 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 rounded-2xl transition"
                                                    title="Edit Assessment"
                                                >
                                                    <Edit2 size={20} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(quiz.id)}
                                                    className="flex-1 md:flex-none p-4 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl transition"
                                                    title="Delete Assessment"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedQuizForLeaderboard(quiz)}
                                                    className="flex-1 md:flex-none p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                                                    title="View Leaderboard"
                                                >
                                                    <Trophy size={20} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                <QuizLeaderboard
                    isOpen={!!selectedQuizForLeaderboard}
                    onClose={() => setSelectedQuizForLeaderboard(null)}
                    quizId={selectedQuizForLeaderboard?.id}
                    quizTitle={selectedQuizForLeaderboard?.title}
                />
            </div>
        </div>
    );
}
