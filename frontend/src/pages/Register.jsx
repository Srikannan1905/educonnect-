import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';


export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' // Default role
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    async function handleRegister(e) {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setLoading(true);
        try {
            await axios.post(import.meta.env.VITE_API_BASE_URL + '/auth/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                parentName: formData.parentName,
                parentPhone: formData.parentPhone
            });

            // On success, redirect to login
            navigate('/login?registered=true');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full opacity-50 blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-2xl shadow-xl w-full max-w-lg z-10 relative"
            >
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-white">Create Account</h2>
                    <p className="text-slate-400 mt-2">Join EduConnect today</p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 flex items-center gap-2 text-sm font-medium border border-red-100"
                    >
                        <Shield size={16} /> {error}
                    </motion.div>
                )}

                <form onSubmit={handleRegister} className="space-y-5">
                    {/* Name Input */}
                    <div>
                        <label htmlFor="name" className="block text-slate-300 text-sm font-bold mb-2 ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                id="name"
                                name="name"
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-transparent focus:bg-white/10 text-slate-200"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-slate-300 text-sm font-bold mb-2 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-transparent focus:bg-white/10 text-slate-200"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-slate-300 text-sm font-bold mb-2 ml-1">I am a...</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['student', 'staff'].map((role) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, role })}
                                    className={`py-2 px-4 rounded-lg text-sm font-semibold capitalize border transition-all ${formData.role === role
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                        : 'bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl text-slate-400 border-white/10 hover:bg-white/10'
                                        }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Password Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="password" className="block text-slate-300 text-sm font-bold mb-2 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-transparent focus:bg-white/10 text-slate-200"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-slate-300 text-sm font-bold mb-2 ml-1">Confirm Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-transparent focus:bg-white/10 text-slate-200"
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parent Details for Students */}
                    {formData.role === 'student' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-2 border-t border-white/5"
                        >
                            <h3 className="text-sm font-bold text-slate-300">Guardian Details (Required for verification)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="parentName" className="sr-only">Parent Name</label>
                                    <input
                                        id="parentName"
                                        name="parentName"
                                        type="text"
                                        className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-transparent focus:bg-white/10 text-slate-200 text-sm"
                                        placeholder="Parent/Guardian Name"
                                        value={formData.parentName || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="parentPhone" className="sr-only">Parent Phone</label>
                                    <input
                                        id="parentPhone"
                                        name="parentPhone"
                                        type="tel"
                                        className="w-full px-4 py-3 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-transparent focus:bg-white/10 text-slate-200 text-sm"
                                        placeholder="Parent Phone Number"
                                        value={formData.parentPhone || ''}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex items-start gap-2 mt-2">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    required
                                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <label htmlFor="terms" className="text-xs text-slate-400">
                                    I confirm that I am 18+ years old OR I am registering under the guidance of my parent/guardian. I understand that my account will be verified before I can book demo classes.
                                </label>
                            </div>
                        </motion.div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:-translate-y-0.5 flex justify-center items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Creating Account...' : (
                            <>
                                Create Account <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-600 font-bold hover:underline transition-colors">
                            Log in here
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
