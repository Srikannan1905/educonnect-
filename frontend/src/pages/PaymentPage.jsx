import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, CreditCard, Loader } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { NavControls } from '../components/ui/DashCards';

export default function PaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('courseId');
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState(null);


    async function fetchCourse() {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/courses/${courseId}`);
            setCourse(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    async function handlePayment(e) {
        e.preventDefault();

        if (!transactionId.trim()) {
            addToast?.('Please enter your UPI Transaction ID', 'error') || alert('Please enter your UPI Transaction ID');
            return;
        }

        if (!screenshot) {
            addToast?.('Please upload a screenshot of your payment', 'error') || alert('Please upload a screenshot of your payment');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to make a payment');
                navigate('/login');
                return;
            }

            const formData = new FormData();
            formData.append('courseId', course.id);
            formData.append('amount', course.price);
            formData.append('transactionId', transactionId);
            formData.append('screenshot', screenshot);

            await axios.post(import.meta.env.VITE_API_BASE_URL + '/payments', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Payment Submitted! Your enrollment is pending admin verification.');
            navigate('/student-dashboard');
        } catch (err) {
            console.error(err);
            if (err.response?.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }
            const errorMessage = err.response?.data?.message || 'Payment Failed';
            alert(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!course) return <div className="p-8 text-center">Loading payment details...</div>;

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full mb-6 flex justify-start">
                <NavControls />
            </div>
            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl shadow-lg max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                {/* Order Summary */}
                <div className="bg-blue-600 text-white p-8 flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                        <div className="mb-4">
                            <p className="text-blue-100 text-sm">Course Name</p>
                            <h3 className="text-xl font-semibold">{course.title}</h3>
                        </div>
                        <div className="mb-4">
                            <p className="text-blue-100 text-sm">Duration</p>
                            <h3 className="text-lg">
                                {course.duration ? `${course.duration} Minutes` : 'Lifetime Access'}
                            </h3>
                        </div>
                        <div className="border-t border-blue-500 pt-4 mt-8">
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total to Pay</span>
                                <span>₹{course.price}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-blue-200 text-sm mt-8">
                        <p>Ensuring secure payment processing.</p>
                    </div>
                </div>

                {/* Payment Form */}
                <div className="p-8">
                    <h2 className="text-2xl font-bold mb-6 text-slate-200">Payment Details</h2>
                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Payment Method</label>
                            <div className="p-4 border border-blue-600 bg-blue-50 text-blue-700 rounded-lg flex flex-col items-center gap-2">
                                <span className="font-bold">UPI</span> Manual QR Verification
                            </div>
                        </div>

                        <div className="space-y-6 text-center">
                            <div className="bg-white p-6 rounded-xl inline-block shadow-inner">
                                <QRCodeCanvas
                                    value={`upi://pay?pa=juggleraj@oksbi&pn=Rajesh%20Narayanan&am=${course.price}&cu=INR`}
                                    size={200}
                                    level={"H"}
                                    includeMargin={true}
                                />
                                <p className="mt-4 text-sm text-slate-800 font-medium">Scan with any UPI App</p>
                                <p className="text-xs text-slate-500">GPay, PhonePe, Paytm, etc.</p>
                            </div>

                            <div className="text-left space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">1. Enter Transaction/Reference ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 321456987456"
                                        className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 focus:border-blue-500 outline-none transition text-slate-900"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-blue-400 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        After paying, enter the Ref Number shown in your app.
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">2. Upload Payment Screenshot</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="w-full p-3 border-2 border-dashed border-slate-600 rounded-lg bg-slate-800 text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition"
                                        onChange={(e) => setScreenshot(e.target.files[0])}
                                        required
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Upload the success screen from your UPI app for verification.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Processing...' : 'Submit'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
