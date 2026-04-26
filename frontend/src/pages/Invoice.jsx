import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Printer, Download, ArrowLeft, CheckCircle } from 'lucide-react';
import { NavControls } from '../components/ui/DashCards';

export default function Invoice() {
    const { paymentId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchInvoice() {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/invoices/${paymentId}`);
                setData(res.data);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to load invoice');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoice();
    }, [paymentId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center">Loading Invoice...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    const { payment, company } = data;

    return (
        <div className="min-h-screen bg-white/10 py-8 px-4 print:bg-white print:p-0">
            {/* Action Buttons - Hidden on Print */}
            <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
                <NavControls />
                <button
                    onClick={handlePrint}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg"
                >
                    <Printer size={20} /> Print / Save as PDF
                </button>
            </div>

            {/* Invoice Container */}
            <div className="max-w-3xl mx-auto bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl shadow-2xl rounded-2xl overflow-hidden print:shadow-none print:rounded-none">
                {/* Header */}
                <div className="bg-blue-900 text-white p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-1">{company.name}</h1>
                        <p className="text-blue-200 text-sm font-medium tracking-wide border-b border-white/10 border-blue-800 pb-4 mb-4">Official Receipt of Payment</p>
                        <div className="space-y-1 text-xs opacity-90">
                            <p>{company.address}</p>
                            <p>Email: {company.email}</p>
                            <p>Phone: {company.phone}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="inline-block bg-blue-800/50 p-4 rounded-xl backdrop-blur-sm border border-blue-700/50 text-left">
                            <h2 className="text-xs font-bold text-blue-300 uppercase mb-1 tracking-widest">Invoice Number</h2>
                            <p className="font-mono text-xl">#INV-{payment.id.substring(0, 8).toUpperCase()}</p>
                            <div className="mt-4 pt-4 border-t border-blue-700/50">
                                <h2 className="text-xs font-bold text-blue-300 uppercase mb-1 tracking-widest">Date Issued</h2>
                                <p className="text-sm">{new Date(payment.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    {/* Bill To & Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Billed To</h3>
                            <div className="space-y-1">
                                <p className="text-xl font-bold text-white">{payment.User.name}</p>
                                <p className="text-slate-400 text-sm">{payment.User.email}</p>
                                <p className="text-slate-400 text-sm">{payment.User.phone}</p>
                                <p className="text-slate-400 text-sm whitespace-pre-line">{payment.User.address}</p>
                            </div>
                        </div>
                        <div className="bg-transparent rounded-2xl p-6 border border-white/5">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Payment Status</h3>
                            <div className="flex flex-col items-center justify-center">
                                <div className="text-green-500 mb-2">
                                    <CheckCircle size={48} />
                                </div>
                                <p className="text-2xl font-black text-green-600 uppercase tracking-tighter">{payment.status}</p>
                                <p className="text-xs text-gray-400 mt-1 uppercase font-bold">Via {payment.method}</p>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="mb-12">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-gray-900">
                                    <th className="py-4 text-xs font-black text-white uppercase tracking-widest">Description</th>
                                    <th className="py-4 text-xs font-black text-white uppercase tracking-widest text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-white/10 border-white/10 border-white/5">
                                    <td className="py-6">
                                        <p className="font-bold text-white text-lg">{payment.Course.title}</p>
                                        <p className="text-slate-400 text-xs italic mt-1">Full Course Enrollment Access</p>
                                    </td>
                                    <td className="py-6 text-right font-bold text-white text-lg">₹{parseFloat(payment.amount).toFixed(2)}</td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td className="py-6 text-right font-black text-gray-400 uppercase tracking-widest">Total Amount</td>
                                    <td className="py-6 text-right text-3xl font-black text-blue-300">₹{parseFloat(payment.amount).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end pt-8 border-t border-white/5">
                        <div>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Transaction Details</h3>
                            <div className="bg-transparent p-4 rounded-xl border border-white/5 space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase">Txn ID:</span>
                                    <span className="font-mono text-white">{payment.transactionId}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-400 font-bold uppercase">Receipt Type:</span>
                                    <span className="text-white font-bold uppercase">Electronic Confirmation</span>
                                </div>
                            </div>
                        </div>
                        <div className="text-center md:text-right space-y-4">
                            <div className="inline-block p-2 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl border border-white/5 rounded-lg shadow-sm">
                                {/* Signature Placeholder */}
                                <div className="w-32 h-12 border-b-2 border-gray-300 italic text-gray-400 flex items-end justify-center pb-1 text-sm">
                                    Authorized Signatory
                                </div>
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium">This is a computer-generated invoice and doesn't require a physical signature.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-transparent p-6 text-center">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Thank you for choosing {company.name}</p>
                </div>
            </div>
        </div>
    );
}
