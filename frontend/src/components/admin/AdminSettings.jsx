import { useState } from 'react';
import axios from 'axios';
import { Shield, Save, Key, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminSettings() {
    const [formData, setFormData] = useState({
        newEmail: '',
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation: If password is being changed, it must match confirmation
        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setStatus({ type: 'error', message: 'New passwords do not match' });
            return;
        }

        // Validation: Must provide either new email or new password
        if (!formData.newEmail && !formData.newPassword) {
            setStatus({ type: 'error', message: 'Please provide new email or new password to update' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.put('/users/profile/credentials', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStatus({ type: 'success', message: res.data.message });

            // If email changed, update local storage
            if (formData.newEmail) {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                user.email = res.data.email;
                localStorage.setItem('user', JSON.stringify(user));
            }

            setFormData({
                newEmail: '',
                newPassword: '',
                confirmPassword: '',
                currentPassword: ''
            });

        } catch (err) {
            setStatus({
                type: 'error',
                message: err.response?.data?.message || 'Failed to update credentials'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500">
                    <Shield size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Security Settings</h1>
                    <p className="text-slate-400 font-medium">Manage your administrative access credentials.</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-glass"
            >
                {status.message && (
                    <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <p className="text-sm font-bold uppercase tracking-widest leading-none">{status.message}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Email Update */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Update Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="email"
                                name="newEmail"
                                value={formData.newEmail}
                                onChange={handleChange}
                                placeholder="Enter new administrative email"
                                className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner"
                            />
                        </div>
                    </div>

                    {/* Password Update */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <div className="relative">
                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                            <div className="relative">
                                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full pl-14 pr-5 py-5 bg-white/5 border border-white/10 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/5 my-4"></div>

                    {/* Current Password Verification */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                            Verification Required <Shield size={10} />
                        </label>
                        <div className="relative">
                            <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                            <input
                                required
                                type="password"
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                placeholder="Enter current password to authorize changes"
                                className="w-full pl-14 pr-5 py-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-white hover:bg-blue-700 transition shadow-xl shadow-blue-500/20 active:scale-95 duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <><Save size={18} /> Authorize & Update Credentials</>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
