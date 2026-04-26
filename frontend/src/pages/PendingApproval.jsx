import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldCheck, Mail, Phone, Image as ImageIcon, BookOpen, CheckCircle2, Info, LogOut, XCircle, AlertCircle, ArrowRight, UserCheck, Search, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
    const [company, setCompany] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    // Fetch fresh user data to get latest status
                    const userRes = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/${parsedUser.id}`);
                    setUser(userRes.data);

                    // If user is now active, redirect to dashboard
                    if (userRes.data.status === 'active') {
                        localStorage.setItem('user', JSON.stringify(userRes.data));
                        navigate('/dashboard');
                        return;
                    }
                }

                const [companyRes, galleryRes] = await Promise.all([
                    axios.get(import.meta.env.VITE_API_BASE_URL + '/company'),
                    axios.get(import.meta.env.VITE_API_BASE_URL + '/gallery')
                ]);
                setCompany(companyRes.data);
                setGallery(Array.isArray(galleryRes.data) ? galleryRes.data.slice(0, 4) : []);
            } catch (err) {
                console.error("Failed to fetch page data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-transparent">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const isRejected = user?.status === 'rejected';

    return (
        <div className="min-h-screen bg-transparent pt-20 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode="wait">
                    {isRejected ? (
                        <motion.div
                            key="rejected"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl shadow-2xl overflow-hidden mb-8 border border-red-100"
                        >
                            <div className="bg-gradient-to-r from-red-600 to-rose-700 p-8 md:p-12 text-white relative">
                                <div className="relative z-10 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 bg-red-500/30 backdrop-blur-md px-4 py-2 rounded-full text-red-100 text-sm font-medium mb-6">
                                        <XCircle size={16} /> Application Status: Declined
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Application Update</h1>
                                    <p className="text-xl text-red-100 mb-8 leading-relaxed">
                                        We appreciate your interest in joining {company?.name || 'EduConnect'}. After a thorough review of your application, our academic board has decided not to proceed at this time.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button onClick={handleLogout} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl text-red-700 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition flex items-center gap-2 shadow-lg">
                                            Return to Login
                                        </button>
                                        <a href={`mailto:${company?.email}`} className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition flex items-center gap-2">
                                            Contact Support
                                        </a>
                                    </div>
                                </div>
                                <ShieldAlert size={300} className="absolute right-[-50px] bottom-[-50px] text-white/5 rotate-12 pointer-events-none" />
                            </div>
                            <div className="p-8 bg-red-50/30 border-t border-red-100">
                                <div className="flex items-start gap-4 p-6 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl shadow-sm">
                                    <div className="p-3 bg-red-100 rounded-xl text-red-600">
                                        <Info size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-200 mb-1">Standard Selection Policy</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed">
                                            Our selection process is highly competitive, focusing on specific institutional needs, current course availability, and localized expertise. A decline does not reflect your professional capabilities, but rather a mismatch with our current requirements.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="pending"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl shadow-xl overflow-hidden mb-8 border border-blue-100"
                        >
                            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 md:p-12 text-white relative">
                                <div className="relative z-10 max-w-2xl">
                                    <div className="inline-flex items-center gap-2 bg-blue-600/30 backdrop-blur-md px-4 py-2 rounded-full text-blue-100 text-sm font-medium mb-6">
                                        <Clock size={16} /> Real-time Application Tracking
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Application Tracker</h1>
                                    <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                        Hi {user?.name || 'Faculty'}, your profile is currently moving through our verification stages. You'll receive a notification as soon as access is granted.
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button onClick={() => window.location.reload()} className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 shadow-2xl text-blue-400 px-6 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition flex items-center gap-2 shadow-lg">
                                            Refresh Status
                                        </button>
                                        <button onClick={handleLogout} className="bg-transparent border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition flex items-center gap-2">
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </div>
                                </div>
                                <ShieldCheck size={300} className="absolute right-[-50px] bottom-[-50px] text-white/5 rotate-12 pointer-events-none" />
                            </div>

                            {/* Professional Step Tracker */}
                            <div className="p-8 md:p-12 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative">
                                    {/* Connection Lines (Desktop) */}
                                    <div className="hidden md:block absolute top-10 left-[10%] right-[10%] h-1 bg-white/10 z-0">
                                        <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: '50%' }}></div>
                                    </div>

                                    <TrackerStep
                                        icon={<CheckCircle2 size={24} />}
                                        title="Submission"
                                        desc="Data successfully received"
                                        status="complete"
                                    />
                                    <TrackerStep
                                        icon={<Search size={24} />}
                                        title="Verification"
                                        desc="Academic board audit"
                                        status="active"
                                    />
                                    <TrackerStep
                                        icon={<UserCheck size={24} />}
                                        title="Activation"
                                        desc="Faculty portal access"
                                        status="pending"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!isRejected && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Rules & Regulations */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-2 space-y-8"
                        >
                            <section className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-3xl shadow-lg border border-white/5">
                                <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-3">
                                    <BookOpen className="text-blue-600" /> Selection Guidelines
                                </h2>
                                <div className="space-y-6">
                                    <RuleItem
                                        text="Credential Authenticity"
                                        desc="Staff must provide verifiable documents. Any discrepancy in academic records leads to immediate application withdrawal."
                                    />
                                    <RuleItem
                                        text="Digital Adaptation"
                                        desc="Approved faculty must complete a platform orientation to master our live-learning and student response tools."
                                    />
                                    <RuleItem
                                        text="Professional Conduct"
                                        desc="We uphold a strict zero-tolerance policy for unethical behavior. Staff must adhere to the EduConnect educator code of conduct."
                                    />
                                    <RuleItem
                                        text="Responsive Engagement"
                                        desc="Our platform prioritizes high engagement. Educators are evaluated based on their ability to simplify complex concepts."
                                    />
                                </div>
                            </section>

                            {/* Contact Card */}
                            <section className="bg-blue-900 rounded-3xl p-8 text-white relative overflow-hidden">
                                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                    <div className="text-center md:text-left">
                                        <h3 className="text-2xl font-bold mb-2">Need Assistance?</h3>
                                        <p className="text-blue-200">Our HR onboarding team is here to help you throughout the process.</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-2xl">
                                            <Phone size={24} className="text-blue-400" />
                                            <div>
                                                <p className="text-[10px] text-blue-300 uppercase font-black uppercase tracking-widest">Call us</p>
                                                <p className="font-bold">{company?.phone || 'Contact Support'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 bg-white/10 px-6 py-4 rounded-2xl">
                                            <Mail size={24} className="text-blue-400" />
                                            <div>
                                                <p className="text-[10px] text-blue-300 uppercase font-black uppercase tracking-widest">Email us</p>
                                                <p className="font-bold">{company?.email || 'hr@educonnect.com'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <AlertCircle size={200} className="absolute left-[-40px] top-[-40px] text-white/5 pointer-events-none" />
                            </section>
                        </motion.div>

                        {/* Gallery Preview */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-3 px-2">
                                <ImageIcon className="text-blue-600" /> Campus Gallery
                            </h2>
                            <div className="grid grid-cols-2 gap-4">
                                {gallery.length > 0 ? gallery.map(item => (
                                    <div key={item.id} className="group relative rounded-2xl overflow-hidden aspect-square shadow-md border border-white/10">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                            <p className="text-white text-[10px] font-medium truncate">{item.title}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-2 bg-white/10 rounded-2xl p-8 text-center text-gray-400">
                                        <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">Gallery empty</p>
                                    </div>
                                )}
                            </div>
                            <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-3xl shadow-lg border border-white/5 relative overflow-hidden group">
                                <h3 className="text-xl font-black text-white mb-4 group-hover:text-blue-600 transition-colors">Our Vision</h3>
                                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                                    EduConnect envisions a borderless classroom where quality education is accessible to every learner, powered by world-class educators like yourself.
                                </p>
                                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-xs font-black text-blue-600 uppercase tracking-widest leading-none">Learn More</span>
                                    <ArrowRight size={18} className="text-blue-600 transform group-hover:translate-x-2 transition-transform" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}

function TrackerStep({ icon, title, desc, status }) {
    const statusConfig = {
        complete: {
            bg: 'bg-blue-600',
            text: 'text-white',
            border: 'border-blue-600',
            indicator: 'Done',
            indicatorColor: 'text-blue-600'
        },
        active: {
            bg: 'bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl',
            text: 'text-blue-600',
            border: 'border-blue-600 border-2',
            indicator: 'In Progress',
            indicatorColor: 'text-blue-600'
        },
        pending: {
            bg: 'bg-white/10',
            text: 'text-gray-400',
            border: 'border-white/10',
            indicator: 'Upcoming',
            indicatorColor: 'text-gray-400'
        }
    };

    const config = statusConfig[status];

    return (
        <div className="flex flex-col items-center text-center max-w-[200px] z-10 w-full md:w-auto">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${config.bg} ${config.text} ${config.border} shadow-xl mb-4 relative transition-transform duration-500 hover:scale-110`}>
                {icon}
                {status === 'active' && (
                    <div className="absolute inset-0 rounded-full border-4 border-blue-600 animate-ping opacity-20"></div>
                )}
            </div>
            <h5 className="font-black text-slate-200 tracking-tight">{title}</h5>
            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-1 px-2">{desc}</p>
            <p className={`text-[10px] font-black uppercase tracking-[2px] mt-3 ${config.indicatorColor}`}>{config.indicator}</p>
        </div>
    );
}

function RuleItem({ text, desc }) {
    return (
        <div className="flex gap-5 group items-start">
            <div className="mt-1.5 min-w-[32px] h-[32px] rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <CheckCircle2 size={16} />
            </div>
            <div>
                <h4 className="font-black text-white group-hover:text-blue-700 transition-colors uppercase text-sm tracking-widest">{text}</h4>
                <p className="text-sm text-slate-400 leading-relaxed mt-1">{desc}</p>
            </div>
        </div>
    );
}
