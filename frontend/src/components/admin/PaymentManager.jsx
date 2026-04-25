import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Trash2, AlertTriangle, X, Loader, Printer } from 'lucide-react'; // Added Loader, X, AlertTriangle, Printer
import { useToast } from '../../components/ui/Toast'; // Import Toast

export default function PaymentManager() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Deletion State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Screenshot/Verification State
    const [screenshotModalOpen, setScreenshotModalOpen] = useState(false);
    const [currentPayment, setCurrentPayment] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        fetchPayments();
    }, []);

    async function fetchPayments() {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (Array.isArray(res.data)) {
                setPayments(res.data);
            }
            setLoading(false);
            setLoading(false);
        } catch (err) {
            console.error("Fetch Payment Error:", err);
            const msg = err.response?.data?.message || err.message;
            const status = err.response?.status;
            addToast(`Failed to fetch payments: ${msg} (${status})`, "error");
            setLoading(false);
        }
    };

    const confirmDelete = (payment) => {
        console.log("Requesting delete for payment:", payment); // DEBUG: Check what we are trying to delete
        setPaymentToDelete(payment);
        setDeleteModalOpen(true);
    };

    async function handleDelete() {
        if (!paymentToDelete) return;

        setIsDeleting(true);
        console.log("Deleting Payment ID:", paymentToDelete.id); // DEBUG: Log the ID being sent

        try {
            const token = localStorage.getItem('token');
            if (!paymentToDelete.id) {
                throw new Error("Payment ID is missing in frontend object");
            }

            await axios.delete(`/payments/${paymentToDelete.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            addToast("Transaction deleted successfully", "success");
            fetchPayments(); // Refresh list
            setDeleteModalOpen(false);
        } catch (err) {
            console.error("Delete Error:", err);
            const msg = err.response?.data?.message || err.message;
            const detail = err.response?.data?.error?.parent?.sqlMessage || '';
            const status = err.response?.status;

            addToast(`Failed to delete: ${msg} (Status: ${status})`, "error");
            alert(`Debug Info:\nStatus: ${status}\nMessage: ${msg}\nDetail: ${detail}\nID Sent: ${paymentToDelete.id}`);
        } finally {
            setIsDeleting(false);
            setPaymentToDelete(null);
        }
    };

    async function handleVerify(paymentId, status) {
        setIsVerifying(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/payments/${paymentId}/verify`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            addToast(`Payment marked as ${status}`, "success");
            fetchPayments();
            setScreenshotModalOpen(false);
        } catch (err) {
            console.error("Verification Error:", err);
            const msg = err.response?.data?.message || err.message;
            addToast(`Failed to verify: ${msg}`, "error");
        } finally {
            setIsVerifying(false);
            setCurrentPayment(null);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-200">Transaction History</h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search by ID or Student..."
                        className="pl-4 pr-10 py-2 border rounded-lg w-72 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
                        onChange={(e) => {
                            const term = e.target.value.toLowerCase();
                            const rows = document.querySelectorAll('tbody tr');
                            rows.forEach(row => {
                                const text = row.innerText.toLowerCase();
                                row.style.display = text.includes(term) ? '' : 'none';
                            });
                        }}
                    />
                </div>
            </div>

            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl shadow-sm border overflow-x-auto">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-transparent border-b border-white/10">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Course</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Method</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction ID</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {(Array.isArray(payments) ? payments : []).map((payment) => (
                                <tr key={payment.id} className="hover:bg-white/10 transition-colors">
                                    <td className="p-4 text-sm text-slate-400">
                                        <div className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</div>
                                        <div className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-white">{payment.User?.name || 'Unknown'}</div>
                                        <div className="text-xs text-slate-400">{payment.User?.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-300">{payment.Course?.title || 'Deleted Course'}</td>
                                    <td className="p-4 font-bold text-emerald-600">₹{payment.amount}</td>
                                    <td className="p-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            {payment.method === 'Credit Card' ? <CreditCard size={14} /> : 'UPI'}
                                            {payment.method}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-slate-400 select-all">
                                            {payment.transactionId}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {payment.status === 'pending' && (
                                            <span className="font-bold text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">PENDING</span>
                                        )}
                                        {payment.status === 'completed' && (
                                            <span className="font-bold text-xs bg-green-100 text-green-700 px-2 py-1 rounded">COMPLETED</span>
                                        )}
                                        {payment.status === 'failed' && (
                                            <span className="font-bold text-xs bg-red-100 text-red-700 px-2 py-1 rounded">REJECTED</span>
                                        )}
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            {payment.status === 'pending' && payment.screenshotUrl && (
                                                <button
                                                    onClick={() => {
                                                        setCurrentPayment(payment);
                                                        setScreenshotModalOpen(true);
                                                    }}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition"
                                                >
                                                    Verify
                                                </button>
                                            )}
                                            <button
                                                onClick={() => confirmDelete(payment)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                                title="Delete Transaction"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && !loading && (
                                <tr><td colSpan="7" className="p-12 text-center text-slate-400">No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="text-red-500" />
                                Confirm Deletion
                            </h3>
                            <button onClick={() => setDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-8">
                            <p className="text-slate-400 mb-2">Are you sure you want to delete this transaction?</p>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-800">
                                <p><strong>ID:</strong> {paymentToDelete?.transactionId}</p>
                                <p><strong>Amount:</strong> ₹{paymentToDelete?.amount}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">This action cannot be undone.</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-slate-300 hover:bg-white/10 transition"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition flex justify-center items-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader className="animate-spin" size={18} /> : 'Delete Permanently'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Screenshot Verification Modal */}
            {screenshotModalOpen && currentPayment && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-[#1e293b] border border-white/10 shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0f172a]">
                            <h3 className="text-lg font-bold text-white">Review Payment Screenshot</h3>
                            <button onClick={() => setScreenshotModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-auto p-4 flex justify-center bg-black/50">
                            {currentPayment.screenshotUrl ? (
                                <img
                                    src={`http://localhost:5000${currentPayment.screenshotUrl}`}
                                    alt="Payment Receipt"
                                    className="max-w-full max-h-[60vh] object-contain rounded border border-white/20"
                                />
                            ) : (
                                <div className="text-slate-400 p-8">No screenshot available.</div>
                            )}
                        </div>

                        <div className="p-6 bg-[#0f172a] border-t border-white/10">
                            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-slate-300 bg-white/5 p-4 rounded-lg">
                                <div><strong className="text-white">Student:</strong> {currentPayment.User?.name} ({currentPayment.User?.email})</div>
                                <div><strong className="text-white">Course:</strong> {currentPayment.Course?.title}</div>
                                <div><strong className="text-white">Amount:</strong> ₹{currentPayment.amount}</div>
                                <div><strong className="text-white">Txn ID:</strong> {currentPayment.transactionId}</div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleVerify(currentPayment.id, 'failed')}
                                    className="flex-1 py-3 bg-red-600/20 text-red-500 border border-red-500/50 rounded-lg font-bold hover:bg-red-600/40 transition flex justify-center items-center"
                                    disabled={isVerifying}
                                >
                                    Reject Payment
                                </button>
                                <button
                                    onClick={() => handleVerify(currentPayment.id, 'completed')}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition flex justify-center items-center"
                                    disabled={isVerifying}
                                >
                                    {isVerifying ? <Loader className="animate-spin" size={18} /> : 'Approve & Enroll'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
