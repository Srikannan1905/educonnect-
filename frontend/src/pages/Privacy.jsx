import { motion } from 'framer-motion';
import { NavControls } from '../components/ui/DashCards';
import { Lock, Eye, CheckCircle, Database } from 'lucide-react';

export default function Privacy() {
    return (
        <div className="min-h-screen bg-transparent py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-6 mb-12">
                    <NavControls />
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 leading-tight">Privacy Policy</h1>
                        <p className="text-slate-400 font-medium uppercase tracking-[0.2em] text-[10px]">Last Updated: February 27, 2026</p>
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] p-8 md:p-12 space-y-10 text-slate-300 leading-relaxed font-medium"
                >
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-green-500/10 rounded-xl text-green-400"><Database size={20} /></div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">1. Information We Collect</h2>
                        </div>
                        <p>
                            We collect information necessary to provide our educational services, including your name, email address, phone number, and academic progress data. We also collect payment information when you purchase a course.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400"><Eye size={20} /></div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">2. How We Use Information</h2>
                        </div>
                        <p>
                            Your data is used to personalize your learning experience, process transactions, communicate platform updates, and improve our services. We do not sell your personal data to third parties.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400"><Lock size={20} /></div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">3. Data Security</h2>
                        </div>
                        <p>
                            We implement industry-standard security measures to protect your personal information. This includes encryption for sensitive data like passwords and payment details.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400"><CheckCircle size={20} /></div>
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">4. Your Rights</h2>
                        </div>
                        <p>
                            You have the right to access, update, or request deletion of your personal data. You can manage your profile settings within the dashboard or contact our support team for assistance.
                        </p>
                    </section>

                    <section className="pt-10 border-t border-white/10 space-y-6">
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-blue-500/10 duration-500">
                            <div className="space-y-2">
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Administration & Development</h3>
                                <p className="text-sm text-slate-400">
                                    For data protection inquiries or technical grievances, please reach out to our principal lead developer:
                                </p>
                            </div>
                            <div className="flex flex-col items-center md:items-end gap-1">
                                <a
                                    href="https://srikannan1905.github.io/Portfolio/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-white font-black text-xl hover:text-blue-400 transition cursor-pointer"
                                >
                                    Srikannan J
                                </a>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 italic">Software Developer</span>
                                <div className="flex gap-4 mt-2">
                                    <a
                                        href="https://srikannan1905.github.io/Portfolio/"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/5 text-slate-400 hover:text-white hover:bg-blue-600 transition"
                                    >
                                        Contact Me
                                    </a>
                                    <a
                                        href="mailto:srikannan9460@gmail.com"
                                        className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/5 text-slate-400 hover:text-white hover:bg-blue-600 transition"
                                    >
                                        Email Support
                                    </a>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 italic text-center">
                            Your trust is our priority. We are committed to protecting your privacy and ensuring a transparent learning environment at EduConnect.
                        </p>
                    </section>
                </motion.div>
            </div>
        </div>
    );
}
