import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('/auth/login', { email, password });
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'admin') {
                navigate('/dashboard', { replace: true });
            } else if (user.role === 'staff') {
                if (user.status === 'pending') {
                    navigate('/pending-approval', { replace: true });
                } else {
                    navigate('/dashboard', { replace: true });
                }
            } else {
                navigate('/courses', { replace: true });
            }
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || err.message;
            setError('Login failed: ' + msg);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white/10 p-4">
            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-xl shadow-md w-full max-w-md">
                <h2 className="text-3xl font-bold text-center mb-6 text-blue-600">Welcome Back</h2>
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-slate-300 font-semibold mb-2">Email Address</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-slate-300 font-semibold mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-bold hover:bg-blue-700 transition flex justify-center items-center gap-2">
                        Login <ArrowRight size={18} />
                    </button>
                </form>
                <p className="mt-4 text-center text-slate-400">
                    Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
