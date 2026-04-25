import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Clock, Search, BookOpen, ExternalLink, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import QuizLeaderboard from '../components/shared/QuizLeaderboard';

export default function QuizHub() {
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
            const res = await axios.get('/quizzes/all');
            setQuizzes(res.data);
        } catch (err) {
            console.error("Failed to fetch quizzes", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuizzes = quizzes.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.Course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.instructor?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-transparent flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-12">
                    <h1 className="text-4xl font-black text-white mb-2">Quiz Hub</h1>
                    <p className="text-slate-400 font-medium italic">Discover and participate in assessments across the entire platform.</p>
                </div>

                <div className="relative mb-8">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search assessments, subjects, or instructors..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-16 pr-6 py-5 bg-[#1e293b]/50 border border-white/10 rounded-[1.5rem] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                    />
                </div>

                <AnimatePresence mode="popLayout">
                    {filteredQuizzes.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 bg-[#1e293b]/30 rounded-[2.5rem] border border-dashed border-white/10">
                            <AlertCircle className="mx-auto mb-4 opacity-20 text-slate-400" size={64} />
                            <p className="text-slate-500 font-bold text-lg">No assessments matching your search were found.</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuizzes.map((quiz) => (
                                <motion.div
                                    layout
                                    key={quiz.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] group hover:bg-[#1e293b] hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">{quiz.Course?.title || 'General'}</span>
                                            <div className="flex items-center gap-1.5 text-slate-500 font-black text-[10px] uppercase tracking-tighter">
                                                <Clock size={12} /> {quiz.timeLimit} Min
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-200 group-hover:text-blue-400 transition mb-2 line-clamp-2">{quiz.title}</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                            By {quiz.instructor?.name || 'Academic System'}
                                        </p>
                                    </div>

                                    <div className="space-y-3 mt-4">
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</span>
                                            {quiz.completed ? (
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${quiz.result?.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {quiz.result?.passed ? 'Passed' : 'Completed'} ({quiz.result?.score}/{quiz.result?.totalPoints})
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest italic">Available</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => navigate(`/quiz/${quiz.id}`)}
                                                className="flex-[2] py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition flex items-center justify-center gap-2"
                                            >
                                                <ExternalLink size={14} /> {quiz.completed ? 'Retake' : 'Participate'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedQuizForLeaderboard(quiz)}
                                                className="flex-1 py-3 bg-white/5 text-yellow-500 border border-yellow-500/20 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-500 hover:text-white transition flex items-center justify-center gap-2"
                                            >
                                                <Trophy size={14} />
                                            </button>
                                        </div>
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
