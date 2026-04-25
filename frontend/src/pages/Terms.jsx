import { motion } from 'framer-motion';
import { NavControls } from '../components/ui/DashCards';
import { Shield, Scale, FileText, AlertCircle } from 'lucide-react';

export default function Terms() {
    return (
        <div className="min-h-screen bg-transparent py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-6 mb-12">
                    <NavControls />
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 leading-tight">Terms & Conditions</h1>
                        <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">Effective Date: February 27, 2026</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] p-8 md:p-12 space-y-10 text-slate-300 leading-relaxed font-medium"
                >
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400"><Scale size={20} /></div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">1. Acceptance of Terms</h2>
                        </div>
                        <p>
                            By accessing or using EduConnect, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><FileText size={20} /></div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">2. Use of Services</h2>
                        </div>
                        <p>
                            EduConnect provides educational courses, assessments, and learning materials. You are granted a limited, non-exclusive, non-transferable license to access and use the platform for personal, non-commercial educational purposes.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400"><Shield size={20} /></div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">3. User Obligations</h2>
                        </div>
                        <ul className="list-none space-y-3 pl-2">
                            <li className="flex gap-3 items-start"><span className="text-blue-500 font-black">•</span> You must provide accurate information during registration.</li>
                            <li className="flex gap-3 items-start"><span className="text-blue-500 font-black">•</span> You are responsible for maintaining the confidentiality of your account credentials.</li>
                            <li className="flex gap-3 items-start"><span className="text-blue-500 font-black">•</span> You agree not to engage in any activity that interferes with or disrupts the platform.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-400"><AlertCircle size={20} /></div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">4. Payments & Refunds</h2>
                        </div>
                        <p>
                            Course fees are clearly stated at the time of purchase. All transactions are processed securely. Refund requests are subject to our refund policy and must be submitted within 7 days of purchase, provided the course material has not been extensively accessed.
                        </p>
                    </section>

                    <section className="pt-8 border-t border-white/10">
                        <p className="text-sm text-slate-500 italic">
                            EduConnect reserves the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
