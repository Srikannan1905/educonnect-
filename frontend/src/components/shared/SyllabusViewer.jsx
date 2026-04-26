import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Search, FileCode, FileType, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SyllabusViewer() {
    const [syllabusList, setSyllabusList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(import.meta.env.VITE_API_BASE_URL + '/syllabus', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSyllabusList(res.data);
        } catch (error) {
            console.error('Failed to fetch syllabus', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (item) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/syllabus/download/${item.id}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', item.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed', error);
            alert('Failed to download file');
        }
    };

    const filteredList = syllabusList.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFileIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'pdf': return <FileText className="text-red-400" size={32} />;
            case 'csv': return <FileCode className="text-green-400" size={32} />;
            case 'doc':
            case 'docx': return <FileType className="text-blue-400" size={32} />;
            default: return <FileText className="text-slate-400" size={32} />;
        }
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-white/5 pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-inner">
                        <BookOpen size={32} className="text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Academic Library</h2>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 opacity-60">Verified course syllabus & repository</p>
                    </div>
                </div>
                <div className="relative group min-w-[320px]">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition" size={20} />
                    <input
                        type="text"
                        placeholder="Search for academic materials..."
                        className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[2rem] text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {loading ? (
                    Array(6).fill(0).map((_, i) => (
                        <div key={i} className="bg-white/5 rounded-[2.5rem] p-8 h-[240px] animate-pulse border border-white/5"></div>
                    ))
                ) : filteredList.length === 0 ? (
                    <div className="col-span-full py-40 text-center space-y-6">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10">
                            <Search size={40} className="text-slate-700" />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-xl italic uppercase tracking-wider">No matches found</h4>
                            <p className="text-slate-500 text-sm font-medium tracking-wide mt-2">Try adjusting your search query for wider parameters.</p>
                        </div>
                    </div>
                ) : (
                    filteredList.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="bg-[#1e293b]/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-8 group relative overflow-hidden hover:border-blue-500/30 transition duration-700"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 group-hover:rotate-12 transition duration-1000 scale-150">
                                {getFileIcon(item.fileType)}
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-blue-500/20 group-hover:bg-blue-500/5 transition duration-700 shadow-glass">
                                        {getFileIcon(item.fileType)}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-slate-500 group-hover:text-blue-400 group-hover:border-blue-500/20 transition duration-700">
                                        {item.fileType.toUpperCase()}
                                    </span>
                                </div>

                                <div className="min-h-[80px]">
                                    <h3 className="text-xl font-black text-white tracking-tight line-clamp-2 leading-tight group-hover:text-blue-400 transition duration-500">{item.title}</h3>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-2 opacity-60 line-clamp-1">{item.fileName}</p>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="text-[10px] font-black uppercase tracking-tight text-slate-500 group-hover:text-slate-300 transition">
                                        Size: <span className="text-white">{item.fileSize}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDownload(item)}
                                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-blue-600 transition shadow-xl shadow-blue-500/20 group-hover:scale-105 active:scale-95 duration-500"
                                    >
                                        <Download size={14} /> Download File
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
