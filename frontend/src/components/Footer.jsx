import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube, MessageCircle } from 'lucide-react';

export default function Footer() {
    const [company, setCompany] = useState(null);
    const location = useLocation();

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await axios.get('/company');
                setCompany(res.data);
            } catch (err) {
                console.error("Failed to fetch company settings for footer");
            }
        };
        fetchSettings();
    }, []);

    if (!company) return null;

    const isDashboard = location.pathname.includes('/dashboard') || location.pathname.includes('/student-dashboard');

    return (
        <footer className={`fixed bottom-0 z-50 bg-[#0b0f19]/80 backdrop-blur-xl border-t border-white/10 text-white py-3 px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 transition-all duration-500 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] ${isDashboard ? 'lg:left-64 lg:w-[calc(100%-16rem)] w-full left-0' : 'left-0 w-full'}`}>
            {/* Left: Brand & Copyright */}
            <div className="flex items-center gap-4">
                <h3 className="text-lg font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">
                    {company.name || 'EduConnect'}
                </h3>
                <span className="hidden md:block w-px h-4 bg-white/10"></span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    &copy; {new Date().getFullYear()} All Rights Reserved
                </p>
            </div>

            {/* Center: Essential Links */}
            <div className="flex gap-6">
                <Link to="/privacy" className="text-slate-400 hover:text-white transition text-[10px] font-black uppercase tracking-widest">Privacy</Link>
                <Link to="/terms" className="text-slate-400 hover:text-white transition text-[10px] font-black uppercase tracking-widest">Terms</Link>
                <Link to="/gallery" className="text-slate-400 hover:text-white transition text-[10px] font-black uppercase tracking-widest">Gallery</Link>
            </div>

            {/* Right: Premium Social Icons */}
            <div className="flex items-center gap-4">
                {company.instagramUrl && (
                    <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-pink-500/20 text-slate-400 hover:text-pink-400 border border-white/5 hover:border-pink-500/30 transition-all duration-300 group" title="Instagram">
                        <Instagram size={18} className="group-hover:scale-110 transition" />
                    </a>
                )}
                {company.youtubeUrl && (
                    <a href={company.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 transition-all duration-300 group" title="YouTube">
                        <Youtube size={18} className="group-hover:scale-110 transition" />
                    </a>
                )}
            </div>
        </footer>
    );
}
