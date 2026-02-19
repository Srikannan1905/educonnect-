import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: Input Email, 2: Success Message

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        // Simple check to distinguish email vs phone
        const isEmail = email.includes('@');
        const payload = isEmail ? { email } : { phone: email };

        try {
            await axios.post('/api/auth/forgot-password', payload);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process request');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="mb-6">
                    <Link to="/login" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm">
                        <ArrowLeft size={16} /> Back to Login
                    </Link>
                </div>

                <div className="text-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <Mail size={32} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Forgot Password?</h2>
                    <p className="text-gray-500 mt-2">No worries, we'll send you reset instructions.</p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">{error}</div>}

                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address or Phone Number</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={email} // reusing email state for both for simplicity, or should add phone state? Let's use it as 'contact'
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Enter your email or phone"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
                        >
                            <Send size={18} /> Send Reset Instructions
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <div className="bg-green-100 text-green-700 p-4 rounded-lg mb-6">
                            <p className="font-semibold">Reset instructions sent!</p>
                            <p className="text-sm mt-1">Please check your email or phone for instructions to reset your password.</p>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            Didn't receive it? Check your spam folder or try again.
                        </p>
                        <button
                            onClick={() => setStep(1)}
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            Try another contact method
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
