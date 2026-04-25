import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Save, HelpCircle, CheckCircle2, ListFilter, Clock, Layout, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavControls } from '../../components/ui/DashCards';

export default function QuizEditor() {
    const { id } = useParams(); // id is only present if editing
    const isEdit = !!id;
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        courseId: '',
        timeLimit: 30,
        passPercentage: 50,
        isActive: true,
        questions: [
            { text: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }
        ]
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const courseRes = await axios.get('/courses');
                // Filter courses: Staff only see their own, Admin sees all
                const availableCourses = (user.role === 'admin' || user.role === 'staff')
                    ? courseRes.data
                    : courseRes.data.filter(c => c.staffId === user.id);

                setCourses(availableCourses);

                if (isEdit) {
                    const quizRes = await axios.get(`/quizzes/${id}`);
                    setQuizData(quizRes.data);
                }
            } catch (err) {
                console.error(err);
                if (isEdit) navigate('/dashboard/quizzes');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isEdit, navigate, user.id, user.role]);

    const handleQuestionUpdate = (qIndex, field, value) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[qIndex][field] = value;
        setQuizData({ ...quizData, questions: updatedQuestions });
    };

    const handleOptionUpdate = (qIndex, oIndex, value) => {
        const updatedQuestions = [...quizData.questions];
        updatedQuestions[qIndex].options[oIndex] = value;
        setQuizData({ ...quizData, questions: updatedQuestions });
    };

    const addQuestion = () => {
        setQuizData({
            ...quizData,
            questions: [...quizData.questions, { text: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]
        });
    };

    const removeQuestion = (index) => {
        if (quizData.questions.length === 1) return;
        const updatedQuestions = quizData.questions.filter((_, i) => i !== index);
        setQuizData({ ...quizData, questions: updatedQuestions });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (isEdit) {
                await axios.put(`/quizzes/${id}`, quizData);
            } else {
                await axios.post('/quizzes', quizData);
            }
            navigate('/dashboard/quizzes');
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save assessment");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;

    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto pb-20">
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <NavControls />
                        <Link to="/dashboard/quizzes" className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition group" title="Quiz Hub">
                            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-slate-200">{isEdit ? 'Edit Assessment' : 'New Assessment'}</h1>
                            <p className="text-slate-500 font-medium">Design professional multiple-choice exams.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-3 rounded-2xl border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visibility</span>
                            <button
                                type="button"
                                onClick={() => setQuizData({ ...quizData, isActive: !quizData.isActive })}
                                className={`w-12 h-6 rounded-full relative transition duration-300 ${quizData.isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${quizData.isActive ? 'left-7' : 'left-1'}`}></div>
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-emerald-700 transition shadow-xl shadow-emerald-500/20 active:scale-95"
                        >
                            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />}
                            {isEdit ? 'Save Changes' : 'Publish Exam'}
                        </button>
                    </div>
                </div>

                {/* General Settings */}
                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] mb-8">
                    <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                        <Settings size={20} className="text-blue-500" />
                        <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest">General Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Assessment Title</label>
                            <input
                                required
                                type="text"
                                value={quizData.title}
                                onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
                                placeholder="e.g. Advanced Calculus - Final Examination"
                                className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Description</label>
                            <textarea
                                value={quizData.description}
                                onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
                                placeholder="Describe the scope of this assessment..."
                                className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition h-32 resize-none shadow-inner"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Assign to Course</label>
                            <div className="relative">
                                <ListFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <select
                                    required
                                    value={quizData.courseId}
                                    onChange={(e) => setQuizData({ ...quizData, courseId: e.target.value })}
                                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner"
                                >
                                    <option value="" className="bg-slate-900">Select Module...</option>
                                    {courses.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.title}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 text-center">Duration (Min)</label>
                                <div className="relative">
                                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="number"
                                        min="1"
                                        value={quizData.timeLimit}
                                        onChange={(e) => setQuizData({ ...quizData, timeLimit: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 focus:outline-none text-center"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 text-center">Pass Threshold (%)</label>
                                <div className="relative">
                                    <CheckCircle2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={quizData.passPercentage}
                                        onChange={(e) => setQuizData({ ...quizData, passPercentage: parseInt(e.target.value) || 0 })}
                                        className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 focus:outline-none text-center"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Questions Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <HelpCircle size={20} className="text-orange-500" />
                            <h2 className="text-sm font-black text-slate-200 uppercase tracking-widest">Questionnaire Board</h2>
                        </div>
                        <span className="text-[10px] font-black bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full uppercase tracking-widest">{quizData.questions.length} Items</span>
                    </div>

                    <AnimatePresence>
                        {quizData.questions.map((question, qIdx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={qIdx}
                                className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] relative group"
                            >
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(qIdx)}
                                    className="absolute -top-3 -right-3 p-3 bg-red-500 text-white rounded-2xl opacity-0 group-hover:opacity-100 transition shadow-xl hover:scale-110"
                                >
                                    <Trash2 size={16} />
                                </button>

                                <div className="mb-8">
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <span className="w-6 h-6 bg-slate-700 text-white rounded-lg flex items-center justify-center text-[10px] font-black">{qIdx + 1}</span>
                                        Question Statement
                                    </label>
                                    <textarea
                                        required
                                        value={question.text}
                                        onChange={(e) => handleQuestionUpdate(qIdx, 'text', e.target.value)}
                                        placeholder="Type your question here..."
                                        className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition h-24 resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.options.map((option, oIdx) => (
                                        <div key={oIdx} className="relative group/opt">
                                            <div
                                                onClick={() => handleQuestionUpdate(qIdx, 'correctAnswer', oIdx)}
                                                className={`absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl flex items-center justify-center cursor-pointer transition-all ${question.correctAnswer === oIdx ? 'bg-emerald-500 text-white' : 'bg-white/10 text-slate-500 hover:bg-white/20'}`}
                                            >
                                                {String.fromCharCode(65 + oIdx)}
                                            </div>
                                            <input
                                                required
                                                type="text"
                                                value={option}
                                                onChange={(e) => handleOptionUpdate(qIdx, oIdx, e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                                className={`w-full pl-16 pr-5 py-5 bg-white/5 border rounded-2xl text-slate-200 focus:outline-none transition ${question.correctAnswer === oIdx ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10'}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    <button
                        type="button"
                        onClick={addQuestion}
                        className="w-full py-8 bg-blue-600/10 border-2 border-dashed border-blue-500/30 rounded-[2.5rem] flex flex-col items-center justify-center gap-3 text-blue-400 hover:bg-blue-600/20 hover:border-blue-500 transition-all group"
                    >
                        <div className="p-3 bg-blue-600 text-white rounded-2xl group-hover:scale-110 transition"><Plus size={24} /></div>
                        <span className="font-black uppercase tracking-widest text-xs">Append New Question</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
