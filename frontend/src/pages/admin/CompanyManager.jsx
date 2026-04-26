import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Globe, Phone, Mail, Map, Instagram, Twitter, Youtube, MessageCircle, Link, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompanyManager() {
    const [settings, setSettings] = useState({
        name: '',
        email: '',
        phone: '',
        whatsappNumber: '',
        address: '',
        instagramUrl: '',
        twitterUrl: '',
        youtubeUrl: '',
        googleMapEmbedUrl: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/company');
            setSettings(res.data);
        } catch (err) {
            console.error("Failed to fetch settings", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await axios.put(import.meta.env.VITE_API_BASE_URL + '/company', settings);
            setMessage({ type: 'success', text: 'Corporate settings updated successfully!' });
            setTimeout(() => setMessage(null), 5000);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const InputField = ({ icon, label, name, value, placeholder, type = "text" }) => (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition duration-300">
                    {icon}
                </div>
                <input
                    type={type}
                    value={value || ''}
                    onChange={(e) => setSettings({ ...settings, [name]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-4 py-4 bg-[#0f172a]/50 border border-white/5 rounded-2xl text-slate-200 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition duration-500"
                />
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        Branding Control <Globe className="text-blue-500" size={32} />
                    </h2>
                    <p className="text-slate-400 font-medium mt-2 italic">Configure your global presence, contact channels, and social connectivity.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`
                        px-8 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition duration-500 shadow-xl
                        ${saving ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-blue-500/20'}
                    `}
                >
                    {saving ? <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div> : <Save size={18} />}
                    {saving ? 'Persisting...' : 'Save Configuration'}
                </button>
            </div>

            {message && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-[1.5rem] mb-12 flex items-center gap-4 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}
                >
                    {message.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <p className="font-black text-sm uppercase tracking-widest">{message.text}</p>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Core Identity */}
                <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] space-y-8 shadow-glass">
                    <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/10">
                            <Globe size={20} />
                        </div>
                        <h3 className="text-xl font-black text-white">Core Identity</h3>
                    </div>

                    <InputField icon={<Globe size={20} />} label="Company Name" name="name" value={settings.name} placeholder="e.g. EduConnect Academy" />
                    <InputField icon={<Mail size={20} />} label="Primary Support Email" name="email" value={settings.email} placeholder="support@educonnect.com" type="email" />
                    <InputField icon={<Phone size={20} />} label="Office Phone" name="phone" value={settings.phone} placeholder="+91 12345 67890" />
                    <InputField icon={<MessageCircle size={20} />} label="WhatsApp Support Number" name="whatsappNumber" value={settings.whatsappNumber} placeholder="Country code + number (e.g. 917871444323)" />

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Office Address</label>
                        <textarea
                            value={settings.address || ''}
                            onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                            placeholder="Full physical address or HQ details..."
                            rows="4"
                            className="w-full p-4 bg-[#0f172a]/50 border border-white/5 rounded-2xl text-slate-200 font-medium focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 outline-none transition duration-500 resize-none"
                        ></textarea>
                    </div>
                </div>

                {/* Social Connectivity */}
                <div className="space-y-8">
                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] space-y-8 shadow-glass">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
                                <Link size={20} />
                            </div>
                            <h3 className="text-xl font-black text-white">Social Connectivity</h3>
                        </div>

                        <InputField icon={<Instagram size={20} />} label="Instagram URL" name="instagramUrl" value={settings.instagramUrl} placeholder="https://instagram.com/yourbrand" />
                        <InputField icon={<Twitter size={20} />} label="X (Twitter) URL" name="twitterUrl" value={settings.twitterUrl} placeholder="https://x.com/yourbrand" />
                        <InputField icon={<Youtube size={20} />} label="YouTube Channel" name="youtubeUrl" value={settings.youtubeUrl} placeholder="https://youtube.com/@yourbrand" />
                    </div>

                    <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] space-y-8 shadow-glass">
                        <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/10">
                                <Map size={20} />
                            </div>
                            <h3 className="text-xl font-black text-white">Geospatial Embed</h3>
                        </div>

                        <InputField icon={<Link size={20} />} label="Google Maps Embed URL" name="googleMapEmbedUrl" value={settings.googleMapEmbedUrl} placeholder="Paste the 'src' from Google Maps iframe embed code..." />

                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                            <p className="text-[10px] text-blue-400 font-bold flex items-center gap-2">
                                <AlertCircle size={12} /> TIP: Go to Google Maps {'>'} Share {'>'} Embed a map {'>'} Copy ONLY the URL in the 'src' attribute.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
