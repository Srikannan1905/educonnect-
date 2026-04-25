import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Award, Trophy, Medal, User, Clock, Target, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function QuizLeaderboard({ isOpen, onClose, quizId, quizTitle }) {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && quizId) {
            fetchLeaderboard();
        }
    }, [isOpen, quizId]);

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/quizzes/${quizId}/leaderboard`);
            setLeaderboard(res.data);
        } catch (err) {
            console.error("Failed to fetch leaderboard", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const topThree = leaderboard.slice(0, 3);
    const others = leaderboard.slice(3);

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-[#1e293b]/90 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-transparent">
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            Leaderboard <Trophy className="text-yellow-400" size={24} />
                        </h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{quizTitle || 'Assessment Results'}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:bg-white/10 p-3 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Calculating Standings...</p>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-20">
                            <Medal className="mx-auto mb-4 opacity-10 text-slate-400" size={64} />
                            <p className="text-slate-400 font-medium italic">No results found yet. Be the first to top the charts!</p>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {/* Podium for Top 3 */}
                            <div className="flex justify-center items-end gap-2 sm:gap-6 pt-8 pb-4">
                                {/* 2nd Place */}
                                {topThree[1] && (
                                    <PodiumItem
                                        data={topThree[1]}
                                        rank={2}
                                        delay={0.2}
                                        bgColor="bg-slate-300/10"
                                        borderColor="border-slate-300/30"
                                        textColor="text-slate-300"
                                        height="h-32"
                                    />
                                )}

                                {/* 1st Place */}
                                {topThree[0] && (
                                    <PodiumItem
                                        data={topThree[0]}
                                        rank={1}
                                        delay={0}
                                        bgColor="bg-yellow-500/20"
                                        borderColor="border-yellow-500/50"
                                        textColor="text-yellow-400"
                                        height="h-44"
                                    />
                                )}

                                {/* 3rd Place */}
                                {topThree[2] && (
                                    <PodiumItem
                                        data={topThree[2]}
                                        rank={3}
                                        delay={0.3}
                                        bgColor="bg-orange-600/10"
                                        borderColor="border-orange-600/30"
                                        textColor="text-orange-600"
                                        height="h-24"
                                    />
                                )}
                            </div>

                            {/* List for Others */}
                            {others.length > 0 && (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2 ml-2">Other Top Participants</h3>
                                    {others.map((item, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 * index }}
                                            key={item.id}
                                            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition duration-300"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-slate-500 w-6">#{index + 4}</span>
                                                <div className="w-10 h-10 rounded-xl bg-slate-700 overflow-hidden border border-white/10">
                                                    {item.student?.profileImage ? (
                                                        <img src={`http://localhost:5000${item.student.profileImage}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={20} /></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-200">{item.student?.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.student?.registrationId}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-blue-400">{item.score}/{item.totalPoints}</p>
                                                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(item.completedAt).toLocaleDateString()}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function PodiumItem({ data, rank, delay, bgColor, borderColor, textColor, height }) {
    const iconSize = rank === 1 ? 40 : 32;
    const rankLabel = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay }}
            className="flex flex-col items-center w-28 sm:w-36 text-center"
        >
            <div className="relative mb-4 group">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden border-2 bg-slate-800 ${borderColor} relative z-10 group-hover:scale-110 transition duration-500`}>
                    {data.student?.profileImage ? (
                        <img src={`http://localhost:5000${data.student.profileImage}`} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={rank === 1 ? 40 : 32} /></div>
                    )}
                </div>
                <div className="absolute -top-3 -right-3 z-20 text-2xl drop-shadow-lg">
                    {rankLabel}
                </div>
            </div>

            <div className="mb-4 flex flex-col items-center">
                <p className="text-xs font-black text-white truncate w-full px-2" title={data.student?.name}>{data.student?.name}</p>
                <div className={`mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${bgColor} ${textColor} border ${borderColor}`}>
                    {Math.round((data.score / data.totalPoints) * 100)}%
                </div>
            </div>

            <div className={`w-full ${height} ${bgColor} border-t-2 ${borderColor} rounded-t-3xl flex flex-col items-center justify-start pt-6 shadow-2xl`}>
                <span className={`text-2xl font-black ${textColor} opacity-50`}>{rank}</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mt-1">Place</span>
            </div>
        </motion.div>
    );
}
