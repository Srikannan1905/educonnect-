import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, ArrowLeft, CheckCircle2, ShieldAlert, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPassword() {
    const { token } = useParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const passwordRegex = /^(?=.*[!@#$%^&*])(?=.{8,})/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long and contain at least one special character (!@#$%^&*)');
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${import.meta.env.VITE_API_BASE_URL}/auth/reset-password/${token}`, { password });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Link may be invalid or expired.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-100 rounded-full opacity-30 blur-3xl"></div>
                <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-100 rounded-full opacity-30 blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 relative"
            >
                <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
                    <ArrowLeft size={16} /> Back to Login
                </Link>

                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-8"
                        >
                            <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                                <CheckCircle2 size={40} className="text-emerald-500" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4">Password Updated!</h2>
                            <p className="text-slate-400 mb-8 leading-relaxed">
                                Your login credentials have been successfully reset. Redirecting you to the login portal...
                            </p>
                            <div className="flex justify-center">
                                <div className="h-1 w-24 bg-slate-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ duration: 3, ease: 'linear' }}
                                        className="h-full bg-blue-600"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-white tracking-tight mb-2">Create New Password</h1>
                                <p className="text-slate-400 font-medium">Please enter a strong password to secure your account.</p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl mb-6 flex items-start gap-3 text-sm font-bold"
                                >
                                    <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="password" name="password" className="block text-slate-300 text-xs font-black uppercase tracking-widest mb-3 ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input
                                            id="password"
                                            type="password"
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                            placeholder="Minimum 8 characters + symbol"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" name="confirmPassword" className="block text-slate-300 text-xs font-black uppercase tracking-widest mb-3 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input
                                            id="confirmPassword"
                                            type="password"
                                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                            placeholder="Match your password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`
                                        w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs 
                                        hover:bg-blue-700 transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-500/20
                                        active:scale-95 duration-300 flex items-center justify-center gap-3
                                        ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                                    `}
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <>Reset Password <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
