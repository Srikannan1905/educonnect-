import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';

export default function GalleryManager() {
    const [photos, setPhotos] = useState([]);
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [uploading, setUploading] = useState(false);
    const [user, setUser] = useState(null);

    const [activeTab, setActiveTab] = useState('all');
    const [category, setCategory] = useState('miscellaneous');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
        fetchPhotos();
    }, []);

    async function fetchPhotos() {
        try {
            const res = await axios.get('/gallery');
            if (Array.isArray(res.data)) {
                setPhotos(res.data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    // Filter photos based on active tab
    const filteredPhotos = activeTab === 'all'
        ? (Array.isArray(photos) ? photos : [])
        : (Array.isArray(photos) ? photos : []).filter(p => p.category === activeTab);

    async function handleDelete(id) {
        if (confirm('Delete this photo?')) {
            try {
                await axios.delete(`/gallery/${id}`, getAuthHeader());
                fetchPhotos();
            } catch {
                alert('Failed to delete photo');
            }
        }
    };

    async function handleUpload(e) {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);
        const token = localStorage.getItem('token');

        try {
            // 1. Upload Image
            const uploadRes = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });
            const imageUrl = uploadRes.data;

            // 2. Save to Gallery
            await axios.post('/gallery', { title, imageUrl, category }, getAuthHeader());

            setFile(null);
            setTitle('');
            setCategory('miscellaneous');
            fetchPhotos();
        } catch {
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const categories = ['event', 'facility', 'miscellaneous'];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Photo Gallery</h2>

            {/* Category Tabs */}
            <div className="flex gap-4 mb-8 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`pb-2 px-4 font-medium capitalize ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-gray-700'}`}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={`pb-2 px-4 font-medium capitalize ${activeTab === cat ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400 hover:text-gray-700'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Upload Section */}
            {user?.role === 'admin' && (
                <div className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-6 rounded-lg shadow mb-8">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Upload size={20} /> Upload New Photo</h3>
                    <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium mb-1">Photo Title</label>
                            <input
                                type="text"
                                className="w-full p-2 border rounded"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Annual Sports Day"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium mb-1">Category</label>
                            <select
                                className="w-full p-2 border rounded"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat} className="capitalize">{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium mb-1">Select Image</label>
                            <input
                                type="file"
                                className="w-full p-2 border rounded bg-transparent"
                                onChange={e => setFile(e.target.files[0])}
                                accept="image/*"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-bold hover:bg-blue-700 disabled:opacity-50 w-full md:w-auto"
                        >
                            {uploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </form>
                </div>
            )}

            {/* Grid View */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {filteredPhotos.map((photo) => (
                    <div key={photo.id} className="relative group bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-lg overflow-x-auto shadow">
                        <img
                            src={`http://localhost:5000${photo.imageUrl}`}
                            alt={photo.title}
                            className="w-full h-40 object-cover"
                        />
                        <div className="p-2">
                            <p className="font-medium text-sm truncate">{photo.title || 'Untitled'}</p>
                            <span className="text-xs bg-white/10 text-slate-400 px-2 py-0.5 rounded-full capitalize">{photo.category}</span>
                        </div>
                        {user?.role === 'admin' && (
                            <button
                                onClick={() => handleDelete(photo.id)}
                                className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-700"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                ))}
                {filteredPhotos.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-400">
                        No photos found in this category.
                    </div>
                )}
            </div>
        </div>
    );
}
