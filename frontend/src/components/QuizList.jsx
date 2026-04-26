import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, HelpCircle, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function QuizList({ courseId }) {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/quizzes/course/${courseId}`);
                setQuizzes(res.data);
            } catch (err) {
                console.error("Failed to load quizzes", err);
            } finally {
                setLoading(false);
            }
        };
        fetchQuizzes();
    }, [courseId]);

    if (loading) return <div className="p-4 flex gap-2"><div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> Loading Assessments...</div>;

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-black text-slate-200 mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                <HelpCircle size={18} className="text-blue-500" /> Course Assessments
            </h3>

            {quizzes.length === 0 ? (
                <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center">
                    <AlertCircle className="mx-auto mb-2 opacity-20 text-slate-400" size={32} />
                    <p className="text-slate-400 text-sm italic">No quizzes available for this course yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition group flex justify-between items-center">
                            <div>
                                <h4 className="font-bold text-slate-200 group-hover:text-blue-400 transition">{quiz.title}</h4>
                                <p className="text-slate-400 text-xs mt-1">{quiz.description || 'Test your knowledge on this module.'}</p>
                                <div className="flex gap-4 mt-3">
                                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                        {quiz.questions?.length || 0} Questions
                                    </span>
                                    <span className="text-[10px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                                        {quiz.timeLimit} Mins
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/quiz/${quiz.id}`)}
                                className="bg-blue-600 p-3 rounded-xl text-white hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 active:scale-95"
                            >
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
