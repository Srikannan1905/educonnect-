import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckSquare, XCircle, ChevronRight, ChevronLeft, Flag, Award, Terminal, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizLeaderboard from '../components/shared/QuizLeaderboard';

export default function QuizPlayer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // Array of { questionId, answerIndex }
    const [timeLeft, setTimeLeft] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        const loadQuizData = async () => {
            try {
                const res = await axios.get(`/quizzes/view/${id}`);
                setQuiz(res.data);
                if (res.data.timeLimit) {
                    setTimeLeft(res.data.timeLimit * 60);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                navigate('/student-dashboard');
            }
        };
        loadQuizData();
    }, [id]);

    useEffect(() => {
        if (timeLeft > 0 && !isFinished) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [timeLeft, isFinished]);

    const handleSelectOption = (optionIndex) => {
        const newAnswers = [...answers];
        const existingAnswerIndex = newAnswers.findIndex(a => a.questionId === quiz.questions[currentQuestionIndex].id);

        if (existingAnswerIndex > -1) {
            newAnswers[existingAnswerIndex].answerIndex = optionIndex;
        } else {
            newAnswers.push({
                questionId: quiz.questions[currentQuestionIndex].id,
                answerIndex: optionIndex
            });
        }
        setAnswers(newAnswers);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await axios.post(`/quizzes/${id}/submit`, { answers });
            setResult(res.data);
            setIsFinished(true);
        } catch (err) {
            alert("Failed to submit quiz.");
        } finally {
            setSubmitting(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (loading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Initializing Assessment...</div>;

    if (isFinished) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl max-w-lg w-full text-center">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border-2 ${result.assessment.passed ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-500' : 'bg-red-500/20 border-red-500/50 text-red-500'}`}>
                        {result.assessment.passed ? <Award size={48} /> : <XCircle size={48} />}
                    </div>
                    <h2 className="text-4xl font-black mb-2">{result.assessment.passed ? 'Success!' : 'Keep Practicing'}</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs mb-8">Score: {result.assessment.score} / {result.assessment.totalPoints}</p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 mb-8">
                        <p className="text-slate-200 leading-relaxed font-medium">{result.feedback}</p>
                    </div>
                    <button
                        onClick={() => setShowLeaderboard(true)}
                        className="w-full bg-yellow-600/20 text-yellow-500 border border-yellow-500/30 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-yellow-600 hover:text-white transition mb-3 flex items-center justify-center gap-2"
                    >
                        <Trophy size={16} /> View Standings
                    </button>
                    <button onClick={() => navigate('/student-dashboard')} className="w-full bg-blue-600 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-xl shadow-blue-500/20">
                        Back to Dashboard
                    </button>

                    <QuizLeaderboard
                        isOpen={showLeaderboard}
                        onClose={() => setShowLeaderboard(false)}
                        quizId={id}
                        quizTitle={quiz.title}
                    />
                </motion.div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOption = answers.find(a => a.questionId === currentQuestion.id)?.answerIndex;

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-md border-b border-white/10 p-4 sticky top-0 z-50">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-2 rounded-lg"><Terminal size={20} /></div>
                        <div>
                            <h1 className="font-black text-lg leading-none">{quiz.title}</h1>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Question {currentQuestionIndex + 1} of {quiz.questions.length}</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-3 px-6 py-2 rounded-full font-black font-mono border ${timeLeft < 60 ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/5 border-white/10 text-slate-200'}`}>
                        <Clock size={18} /> {formatTime(timeLeft)}
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="flex-grow container mx-auto flex items-center justify-center p-6">
                <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="max-w-3xl w-full"
                >
                    <div className="bg-slate-800/30 p-8 rounded-[2rem] border border-white/5 mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-snug">{currentQuestion.text}</h2>

                        <div className="space-y-4">
                            {currentQuestion.options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectOption(idx)}
                                    className={`
                                        w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center gap-4 group
                                        ${selectedOption === idx
                                            ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-500/20'
                                            : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'}
                                    `}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black ${selectedOption === idx ? 'bg-white text-blue-600' : 'bg-white/10 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition'}`}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>
                                    <span className={`text-lg font-medium ${selectedOption === idx ? 'text-white' : 'text-slate-300 group-hover:text-white transition'}`}>
                                        {option}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center px-4">
                        <button
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-20 transition"
                        >
                            <ChevronLeft size={32} />
                        </button>

                        {currentQuestionIndex === quiz.questions.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || answers.length < quiz.questions.length}
                                className={`px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 transition shadow-xl ${answers.length < quiz.questions.length ? 'bg-white/5 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'}`}
                            >
                                {submitting ? 'Authenticating...' : <><CheckSquare size={18} /> Finalize Attempt</>}
                            </button>
                        ) : (
                            <button
                                onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                className="p-4 bg-blue-600 rounded-2xl text-white hover:bg-blue-700 transition shadow-lg shadow-blue-500/20"
                            >
                                <ChevronRight size={32} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
