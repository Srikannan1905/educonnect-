import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, Trash2, AlertTriangle, X, Loader } from 'lucide-react'; // Added Loader, X, AlertTriangle
import { useToast } from '../../components/ui/Toast'; // Import Toast

export default function PaymentManager() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Deletion State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [paymentToDelete, setPaymentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { addToast } = useToast();

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPayments(res.data);
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

    const handleDelete = async () => {
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

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Transaction History</h2>
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

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Transaction ID</th>
                                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 text-sm text-gray-600">
                                        <div className="font-medium">{new Date(payment.createdAt).toLocaleDateString()}</div>
                                        <div className="text-xs text-gray-400">{new Date(payment.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-medium text-gray-900">{payment.User?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{payment.User?.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-700">{payment.Course?.title || 'Deleted Course'}</td>
                                    <td className="p-4 font-bold text-emerald-600">₹{payment.amount}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1">
                                            {payment.method === 'Credit Card' ? <CreditCard size={14} /> : 'UPI'}
                                            {payment.method}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 select-all">
                                            {payment.transactionId}
                                        </span>
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${payment.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                            payment.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' :
                                                'bg-yellow-50 text-yellow-700 border-yellow-200'
                                            }`}>
                                            {payment.status}
                                        </span>
                                        <button
                                            onClick={() => confirmDelete(payment)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                                            title="Delete Transaction"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && !loading && (
                                <tr><td colSpan="7" className="p-12 text-center text-gray-500">No transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom Delete Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <AlertTriangle className="text-red-500" />
                                Confirm Deletion
                            </h3>
                            <button onClick={() => setDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-8">
                            <p className="text-gray-600 mb-2">Are you sure you want to delete this transaction?</p>
                            <div className="bg-red-50 p-3 rounded-lg border border-red-100 text-sm text-red-800">
                                <p><strong>ID:</strong> {paymentToDelete?.transactionId}</p>
                                <p><strong>Amount:</strong> ₹{paymentToDelete?.amount}</p>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">This action cannot be undone.</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
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
        </div>
    );
}
