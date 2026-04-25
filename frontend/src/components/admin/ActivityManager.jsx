import { useState, useMemo } from 'react';
import { Search, Filter, Bell, User, Calendar, Clock, ChevronDown, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityManager({ activities, onRefresh }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterRole, setFilterRole] = useState('all');

    const filteredActivities = useMemo(() => {
        return activities.filter(act => {
            const matchesSearch = act.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                act.user?.name?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAction = filterAction === 'all' || act.action === filterAction;
            const matchesRole = filterRole === 'all' || (act.user?.role === filterRole || act.userRole === filterRole);
            return matchesSearch && matchesAction && matchesRole;
        });
    }, [activities, searchTerm, filterAction, filterRole]);

    const actionTypes = ['all', ...new Set(activities.map(a => a.action))];
    const roles = ['all', 'admin', 'staff', 'student'];

    const getActionIcon = (action) => {
        switch (action) {
            case 'session_started': return <CheckCircle size={18} className="text-green-500" />;
            case 'session_ended': return <Clock size={18} className="text-orange-500" />;
            case 'booking_created': return <Calendar size={18} className="text-blue-500" />;
            default: return <Bell size={18} className="text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">System Activity Log</h2>
                    <p className="text-slate-400 font-medium text-sm mt-1">Real-time oversight of platform interactions</p>
                </div>
                <button
                    onClick={onRefresh}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-300 transition-all active:scale-95"
                >
                    <RefreshCw size={16} />
                    <span className="text-xs font-black uppercase tracking-widest">Refresh logs</span>
                </button>
            </div>

            {/* Controls Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#1e293b]/30 backdrop-blur-xl border border-white/5 rounded-3xl">
                <div className="md:col-span-2 relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs by name or details..."
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <select
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white appearance-none focus:outline-none focus:border-blue-500/50 transition font-bold text-xs uppercase tracking-widest"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        {actionTypes.map(type => (
                            <option key={type} value={type} className="bg-[#0f172a]">{type.replace('_', ' ')}</option>
                        ))}
                    </select>
                </div>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <select
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-white appearance-none focus:outline-none focus:border-blue-500/50 transition font-bold text-xs uppercase tracking-widest"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        {roles.map(role => (
                            <option key={role} value={role} className="bg-[#0f172a]">{role}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Logs Area */}
            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-[2rem] overflow-hidden">
                <div className="divide-y divide-white/5">
                    {filteredActivities.length === 0 ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                                <Search size={32} className="text-slate-600" />
                            </div>
                            <div>
                                <h4 className="text-white font-black">No matching logs</h4>
                                <p className="text-slate-500 text-sm">Try adjusting your filters or search term</p>
                            </div>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredActivities.map((act, index) => (
                                <motion.div
                                    key={act.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="p-6 hover:bg-white/5 transition flex gap-6 items-start group"
                                >
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-blue-500/30 group-hover:bg-blue-500/5 transition duration-500">
                                        {getActionIcon(act.action)}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-0.5">
                                                <h4 className="font-black text-white capitalize tracking-tight group-hover:text-blue-400 transition">
                                                    {act.action.replace('_', ' ')}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{new Date(act.createdAt).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{new Date(act.createdAt).toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${act.user?.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    act.user?.role === 'staff' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-white/5 text-slate-400 border-white/10'
                                                }`}>
                                                {act.user?.role || act.userRole}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-3xl">
                                            {act.details}
                                        </p>
                                        <div className="flex items-center gap-2 pt-2">
                                            <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                                                <User size={12} className="text-slate-500" />
                                            </div>
                                            <span className="text-[11px] text-slate-500 font-bold italic">{act.user?.name || 'System'}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
