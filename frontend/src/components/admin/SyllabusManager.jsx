import { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Trash2, FileText, Download, Plus, X, Search, FileCode, FileType } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SyllabusManager() {
    const [syllabusList, setSyllabusList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [newSyllabus, setNewSyllabus] = useState({
        title: '',
        description: '',
        file: null
    });

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/syllabus', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSyllabusList(res.data);
        } catch (error) {
            console.error('Failed to fetch syllabus', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setNewSyllabus({ ...newSyllabus, file: e.target.files[0] });
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newSyllabus.file) return alert('Please select a file');
        if (!newSyllabus.title) return alert('Please enter a title');

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('file', newSyllabus.file);
            formData.append('title', newSyllabus.title);
            formData.append('description', newSyllabus.description);

            await axios.post('/syllabus', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            alert('Syllabus established successfully!');
            setIsModalOpen(false);
            setNewSyllabus({ title: '', description: '', file: null });
            fetchSyllabus();
        } catch (error) {
            console.error('Establishment Error:', error);
            const message = error.response?.data?.message || 'Upload failed';
            alert(message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this syllabus?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/syllabus/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchSyllabus();
        } catch (error) {
            alert('Delete failed');
        }
    };

    const filteredList = syllabusList.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getFileIcon = (type) => {
        switch (type.toLowerCase()) {
            case 'pdf': return <FileText className="text-red-400" />;
            case 'csv': return <FileCode className="text-green-400" />;
            case 'doc':
            case 'docx': return <FileType className="text-blue-400" />;
            default: return <FileText className="text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Curriculum & Syllabus</h2>
                    <p className="text-slate-400 font-medium text-sm mt-1">Manage academic documentation for students</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-blue-500/20"
                >
                    <Plus size={18} /> Upload Syllabus
                </button>
            </div>

            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition" size={18} />
                <input
                    type="text"
                    placeholder="Search documents by title or description..."
                    className="w-full pl-12 pr-4 py-4 bg-[#1e293b]/30 backdrop-blur-xl border border-white/5 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-[#1e293b]/50 backdrop-blur-xl border border-white/10 shadow-glass rounded-[2rem] overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/5">
                    {loading ? (
                        <div className="col-span-full p-20 text-center text-slate-500 italic">Synchronizing syllabus records...</div>
                    ) : filteredList.length === 0 ? (
                        <div className="col-span-full p-20 text-center space-y-4">
                            <FileText size={48} className="text-slate-700 mx-auto" />
                            <p className="text-slate-400 font-medium tracking-wide">No syllabus documents found</p>
                        </div>
                    ) : (
                        filteredList.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-8 bg-slate-900/40 hover:bg-white/5 transition group flex gap-6 items-start"
                            >
                                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 group-hover:border-blue-500/30 group-hover:scale-110 transition duration-500">
                                    {getFileIcon(item.fileType)}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition">{item.title}</h3>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownload(item)}
                                                className="p-2 bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-lg transition border border-white/5"
                                            >
                                                <Download size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition border border-white/5"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 italic">{item.description || 'No additional description provided.'}</p>
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 pt-2">
                                        <span className="flex items-center gap-1"><FileCode size={12} /> {item.fileType.toUpperCase()}</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                        <span>{item.fileSize}</span>
                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-2xl w-full max-w-lg overflow-y-auto max-h-[min(90vh,750px)] custom-scrollbar relative z-10"
                        >
                            <div className="p-10 space-y-8">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-2xl font-black text-white">Upload Syllabus</h3>
                                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Official Document Repository</p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="bg-white/5 p-3 rounded-full hover:bg-white/10 transition"><X size={20} className="text-slate-400" /></button>
                                </div>

                                <form onSubmit={handleUpload} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Document Title</label>
                                        <input
                                            required
                                            className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500/50 transition text-white font-bold"
                                            placeholder="e.g. Grade 10 Physics Syllabus"
                                            value={newSyllabus.title}
                                            onChange={(e) => setNewSyllabus({ ...newSyllabus, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Brief Description</label>
                                        <textarea
                                            className="w-full p-4 bg-white/5 border border-white/5 rounded-2xl outline-none focus:border-blue-500/50 transition text-white font-medium min-h-[100px] resize-none"
                                            placeholder="Details about covered modules..."
                                            value={newSyllabus.description}
                                            onChange={(e) => setNewSyllabus({ ...newSyllabus, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Target File</label>
                                        <div className="relative cursor-pointer">
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                accept=".pdf,.doc,.docx,.csv"
                                            />
                                            <div className={`w-full p-8 border-2 border-dashed rounded-3xl flex flex-col items-center gap-3 transition duration-500
                                                ${newSyllabus.file ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
                                                <Upload className={newSyllabus.file ? 'text-blue-400' : 'text-slate-600'} size={32} />
                                                <div className="text-center">
                                                    <p className={`text-xs font-black uppercase tracking-tight ${newSyllabus.file ? 'text-blue-400' : 'text-slate-400'}`}>
                                                        {newSyllabus.file ? newSyllabus.file.name : 'Click or Drag document here'}
                                                    </p>
                                                    {newSyllabus.file && (
                                                        <p className="text-[10px] text-blue-500/60 font-medium mt-1 uppercase tracking-widest">
                                                            {(newSyllabus.file.size / 1024 / 1024).toFixed(2)} MB • {newSyllabus.file.name.split('.').pop().toUpperCase()}
                                                        </p>
                                                    )}
                                                </div>
                                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">PDF, DOC, DOCX, or CSV (Max 10MB)</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl disabled:opacity-50 flex items-center justify-center gap-3
                                            ${uploading ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'}`}
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                                                Synchronizing Record...
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={18} /> Establish Syllabus Document
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
