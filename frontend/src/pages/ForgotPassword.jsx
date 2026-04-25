import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft, Send, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPassword() {
    const [phone, setPhone] = useState('');
    const [userId, setUserId] = useState(null);
    const [questionType, setQuestionType] = useState('');
    const [questionText, setQuestionText] = useState('');
    const [answer, setAnswer] = useState('');

    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Input Phone, 2: Security Question, 3: Success
    const navigate = useNavigate();

    const handlePhoneSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('/auth/verify-phone-user', { phone });
            setUserId(res.data.userId);
            setQuestionType(res.data.questionType);
            setQuestionText(res.data.questionText);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to find account. Please check your phone number.');
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const res = await axios.post('/auth/verify-security-answer', {
                userId,
                questionType,
                answer
            });

            setStep(3);

            // Redirect to reset password page with the generated token
            setTimeout(() => {
                navigate(`/reset-password/${res.data.resetToken}`);
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Incorrect answer. Please try again.');
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
                className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-3xl w-full max-w-md z-10 relative"
            >
                <div className="mb-6">
                    <Link to="/login" className="text-slate-400 hover:text-gray-200 transition-colors flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="bg-blue-500/20 p-4 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-blue-500/30">
                        {step === 1 ? <Phone size={36} className="text-blue-500" /> : <ShieldCheck size={36} className="text-blue-500" />}
                    </div>
                    <h2 className="text-3xl font-black text-white mb-2">
                        {step === 1 && "Reset Password"}
                        {step === 2 && "Security Check"}
                        {step === 3 && "Verified!"}
                    </h2>
                    <p className="text-slate-400 font-medium">
                        {step === 1 && "Enter your registered phone number."}
                        {step === 2 && "Answer the security question to verify your identity."}
                        {step === 3 && "Redirecting to password reset portal..."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form key="step1" onSubmit={handlePhoneSubmit} className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-sm font-bold">{error}</div>}

                            <div>
                                <label htmlFor="phone" className="block text-slate-300 text-xs font-black uppercase tracking-widest mb-3 ml-1">Phone Number</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        placeholder="Enter your phone number"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 shadow-blue-500/20"
                            >
                                <Send size={18} /> Continue
                            </button>
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.form key="step2" onSubmit={handleAnswerSubmit} className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-2xl text-sm font-bold">{error}</div>}

                            <div>
                                <label htmlFor="answer" className="block text-slate-300 text-sm font-bold mb-3 ml-1 bg-slate-800/50 p-4 rounded-xl border border-white/5 text-center text-blue-200">
                                    {questionText}
                                </label>
                                <div className="relative group">
                                    <ShieldCheck className="absolute left-4 top-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        id="answer"
                                        type="text"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        placeholder="Your answer"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 shadow-blue-500/20"
                            >
                                Verify Identity
                            </button>
                            <div className="text-center mt-4">
                                <button type="button" onClick={() => setStep(1)} className="text-sm text-slate-400 hover:text-white transition-colors">
                                    Use a different phone number
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" className="text-center py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="bg-emerald-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 animate-pulse">
                                <CheckCircle2 size={32} className="text-emerald-500" />
                            </div>
                            <div className="flex justify-center mt-6">
                                <div className="h-1 w-24 bg-slate-700 rounded-full overflow-hidden">
                                    <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 2, ease: 'linear' }} className="h-full bg-blue-500" />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
