import { useState, useEffect } from 'react';
import axios from 'axios';
import { Award, Target, TrendingUp, ChevronRight, BookOpen, Clock, CheckCircle2, AlertCircle, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import QuizLeaderboard from '../shared/QuizLeaderboard';

export default function Gradebook() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedQuizForLeaderboard, setSelectedQuizForLeaderboard] = useState(null);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/quizzes/results/my');
                setResults(res.data);
            } catch (err) {
                console.error("Failed to fetch results", err);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, []);

    const averageScore = results.length > 0
        ? (results.reduce((acc, curr) => acc + (curr.score / curr.totalPoints), 0) / results.length * 100).toFixed(1)
        : 0;

    const passRate = results.length > 0
        ? (results.filter(r => r.passed).length / results.length * 100).toFixed(0)
        : 0;

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <>
            <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Header Section */}
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Academic Gradebook <Award className="text-blue-500" size={32} />
                    </h2>
                    <p className="text-slate-400 font-medium mt-2 italic">Track your progress and performance across all enrolled assessments.</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-glass relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:scale-110 transition duration-700">
                            <TrendingUp size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Average Performance</p>
                            <h3 className="text-4xl font-black text-white">{averageScore}%</h3>
                            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                <TrendingUp size={14} /> Total attempts: {results.length}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-glass relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:scale-110 transition duration-700">
                            <Target size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Rate</p>
                            <h3 className="text-4xl font-black text-white">{passRate}%</h3>
                            <div className="mt-4 flex items-center gap-2 text-blue-400 text-xs font-bold">
                                <CheckCircle2 size={14} /> Pass percentage achievement
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-glass relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 text-orange-500/10 group-hover:scale-110 transition duration-700">
                            <Award size={120} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Certificates Earned</p>
                            <h3 className="text-4xl font-black text-white">{results.filter(r => r.passed).length}</h3>
                            <div className="mt-4 flex items-center gap-2 text-orange-400 text-xs font-bold">
                                <Award size={14} /> Successful completions
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Table */}
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-[2.5rem] overflow-hidden">
                    <div className="p-10 border-b border-white/5 flex items-center justify-between">
                        <div>
                            <h3 className="text-2xl font-black text-white">Detailed Transcript</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Quiz Activity Logs</p>
                        </div>
                        <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Total Records: {results.length}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {results.length === 0 ? (
                            <div className="p-20 text-center text-slate-500 italic">
                                <AlertCircle className="mx-auto mb-4 opacity-10" size={64} />
                                No assessment history found. Enroll and complete quizzes to see your grades here.
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5">
                                        <th className="px-10 py-6">Assessment Title</th>
                                        <th className="px-6 py-6 text-center">Score</th>
                                        <th className="px-6 py-6 text-center">Status</th>
                                        <th className="px-10 py-6 text-right">Completion Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {results.map((res) => (
                                        <tr key={res.id} className="group hover:bg-white/5 transition duration-500">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition duration-500">
                                                        <BookOpen size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-slate-200">{res.Quiz?.title || 'Assessment'}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Digital Examination</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-8 text-center">
                                                <span className={`text-xl font-black ${res.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {res.score}/{res.totalPoints}
                                                </span>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Raw Performance</p>
                                            </td>
                                            <td className="px-6 py-8 text-center">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${res.passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                    {res.passed ? 'Pass' : 'Fail'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedQuizForLeaderboard(res.Quiz)}
                                                        className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 hover:text-white transition"
                                                    >
                                                        <Trophy size={12} /> Standings
                                                    </button>
                                                    <div className="text-right">
                                                        <p className="text-sm font-black text-slate-400">{new Date(res.createdAt).toLocaleDateString()}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 mt-1 justify-end">
                                                            <Clock size={10} /> {new Date(res.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            <QuizLeaderboard
                isOpen={!!selectedQuizForLeaderboard}
                onClose={() => setSelectedQuizForLeaderboard(null)}
                quizId={selectedQuizForLeaderboard?.id}
                quizTitle={selectedQuizForLeaderboard?.title}
            />
        </>
    );
}
