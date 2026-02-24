import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, AlertCircle, CreditCard, Loader } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

export default function PaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('courseId');
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');
    const [transactionId, setTransactionId] = useState('');

    // Card State
    const [cardDetails, setCardDetails] = useState({
        number: '',
        expiry: '',
        cvv: '',
        name: ''
    });

    const handleCardChange = (e) => {
        setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
    };



    async function fetchCourse() {
        try {
            const res = await axios.get(`/courses/${courseId}`);
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
        setLoading(true);



        // Simulate Payment Delay (For Card/UPI manual)
        setTimeout(async () => {
            try {
                const finalTransactionId = paymentMethod === 'UPI'
                    ? transactionId
                    : `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

                if (paymentMethod === 'UPI' && !finalTransactionId) {
                    alert('Please enter the Transaction ID form your UPI App');
                    setLoading(false);
                    return;
                }

                const token = localStorage.getItem('token');
                if (!token) {
                    alert('Please login to make a payment');
                    navigate('/login');
                    return;
                }

                await axios.post('/payments', {
                    courseId: course.id,
                    amount: course.price,
                    method: paymentMethod,
                    transactionId: finalTransactionId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                alert('Payment Successful! Course Added.');
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
                const errorDetail = err.response?.data?.error || '';
                const validationErrors = Array.isArray(err.response?.data?.details?.errors)
                    ? err.response.data.details.errors.map(e => e.message).join('\n')
                    : '';
                alert(`Error: ${errorMessage}\n${errorDetail}\n${validationErrors}`);
                setLoading(false);
            }
        }, 2000);
    };

    if (!course) return <div className="p-8 text-center">Loading payment details...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden">
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
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Payment Details</h2>
                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" onClick={() => setPaymentMethod('Credit Card')} className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${paymentMethod === 'Credit Card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
                                    <CreditCard /> Credit Card
                                </button>
                                <button type="button" onClick={() => setPaymentMethod('UPI')} className={`p-4 border rounded-lg flex flex-col items-center gap-2 ${paymentMethod === 'UPI' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'hover:bg-gray-50'}`}>
                                    <span className="font-bold">UPI</span> UPI / GPay
                                </button>
                            </div>
                        </div>

                        {paymentMethod === 'Credit Card' && (
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    name="number"
                                    placeholder="Card Number"
                                    className="w-full p-3 border rounded-lg"
                                    value={cardDetails.number}
                                    onChange={handleCardChange}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        name="expiry"
                                        placeholder="MM/YY"
                                        className="w-full p-3 border rounded-lg"
                                        value={cardDetails.expiry}
                                        onChange={handleCardChange}
                                        required
                                    />
                                    <input
                                        type="text"
                                        name="cvv"
                                        placeholder="CVV"
                                        className="w-full p-3 border rounded-lg"
                                        value={cardDetails.cvv}
                                        onChange={handleCardChange}
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Card Holder Name"
                                    className="w-full p-3 border rounded-lg"
                                    value={cardDetails.name}
                                    onChange={handleCardChange}
                                    required
                                />
                            </div>
                        )}

                        {paymentMethod === 'UPI' && (
                            <div className="space-y-6 text-center">
                                <div className="bg-gray-100 p-6 rounded-xl inline-block shadow-inner">
                                    <QRCodeCanvas
                                        value={`upi://pay?pa=educonnect@upi&pn=EduConnect&am=${course.price}&cu=INR`}
                                        size={200}
                                        level={"H"}
                                        includeMargin={true}
                                    />
                                    <p className="mt-4 text-sm text-gray-500 font-medium">Scan with any UPI App</p>
                                    <p className="text-xs text-gray-400">GPay, PhonePe, Paytm, etc.</p>
                                </div>

                                <div className="text-left">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Enter Transaction/Reference ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 321456987456"
                                        className="w-full p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 focus:border-blue-500 outline-none transition"
                                        value={transactionId}
                                        onChange={(e) => setTransactionId(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                        <AlertCircle size={12} />
                                        After paying, enter the Ref Number shown in your app.
                                    </p>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? 'Processing...' : `Pay ₹${course.price}`}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
