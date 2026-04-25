import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * StatCard - Displays dynamic statistics with trends
 */
export const StatCard = ({ title, value, icon, color, trend, onClick }) => {
    const colorClasses = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
        indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-indigo-500/10',
        emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
        orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20 shadow-orange-500/10',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10'
    };

    return (
        <motion.div
            onClick={onClick}
            whileHover={{ y: -12, scale: 1.02 }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className={`bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass p-8 rounded-[2.5rem] group hover:shadow-[0_40px_60px_-12px_rgba(0,0,0,0.3)] transition-all relative overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex justify-between items-start mb-8">
                <div className={`p-4 rounded-3xl border ${colorClasses[color || 'blue']} transition duration-700 group-hover:scale-110 group-hover:shadow-xl`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full ${trend.includes('+') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400'}`}>
                        {trend}
                    </span>
                )}
            </div>
            <div className="relative z-10">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</p>
                <h4 className="text-4xl font-black text-white tracking-tighter leading-none">{value}</h4>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-150 group-hover:rotate-12 transition duration-1000 pointer-events-none">
                {icon}
            </div>
        </motion.div>
    );
};

/**
 * FeatureCard - Professional Vertical Stack
 */
export const FeatureCard = ({ icon, label, desc, color, onClick }) => {
    const colors = {
        blue: 'from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30 shadow-blue-500/10',
        indigo: 'from-indigo-500/20 to-indigo-600/20 text-indigo-400 border-indigo-500/30 shadow-indigo-500/10',
        purple: 'from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30 shadow-purple-500/10',
        orange: 'from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30 shadow-orange-500/10',
        emerald: 'from-emerald-500/20 to-emerald-600/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
    };

    return (
        <motion.button
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className="flex flex-col items-center text-center p-5 bg-[#1e293b]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] hover:border-blue-500/40 hover:bg-blue-500/5 transition-all duration-700 group w-full relative overflow-hidden h-full"
        >
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors[color || 'blue']} flex items-center justify-center border transition-all duration-700 mb-4 group-hover:scale-110 group-hover:rotate-3 shadow-2xl`}>
                <div className="opacity-80 group-hover:opacity-100 transition duration-700 transform group-hover:scale-110">
                    {icon}
                </div>
            </div>

            <div className="space-y-1 relative z-10">
                <h4 className="text-sm font-black text-white tracking-tight group-hover:text-blue-400 transition duration-500 leading-tight">{label}</h4>
                <p className="text-[9px] font-bold text-slate-500 leading-tight tracking-[0.05em] uppercase opacity-70 group-hover:opacity-100 transition duration-500">
                    {desc}
                </p>
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-0 group-hover:opacity-10 transition duration-700 scale-150 transform rotate-12">
                {icon}
            </div>
        </motion.button>
    );
};

/**
 * NavControls - Global Back/Forward navigation controls
 */
export const NavControls = ({ className = "" }) => {
    const navigate = useNavigate();

    return (
        <div className={`flex items-center gap-1.5 p-1.5 bg-white/5 backdrop-blur-3xl border border-white/5 rounded-2xl ${className}`}>
            <button
                onClick={() => navigate(-1)}
                className="p-2.5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90 group rounded-xl"
                title="Go Back"
            >
                <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition" />
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-1"></div>
            <button
                onClick={() => navigate(1)}
                className="p-2.5 hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-90 group rounded-xl"
                title="Go Forward"
            >
                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition" />
            </button>
        </div>
    );
};
