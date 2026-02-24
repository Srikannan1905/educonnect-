import { useState, useEffect } from 'react';
import axios from 'axios';

import Loader from '../components/ui/Loader';

export default function Gallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        async function fetchPhotos() {
            try {
                const res = await axios.get('/gallery');
                if (Array.isArray(res.data)) {
                    setPhotos(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch photos", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPhotos();
    }, []);

    const categories = ['all', 'event', 'facility', 'miscellaneous'];

    const filteredPhotos = activeTab === 'all'
        ? (Array.isArray(photos) ? photos : [])
        : (Array.isArray(photos) ? photos : []).filter(p => p.category === activeTab);

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Campus Gallery</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">Explore our vibrant campus life, state-of-the-art facilities, and memorable events.</p>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveTab(cat)}
                            className={`px-6 py-2 rounded-full font-medium capitalize transition-all duration-300 ${activeTab === cat
                                ? 'bg-blue-600 text-white shadow-lg scale-105'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <div className="columns-1 md:columns-3 gap-6 space-y-6">
                        {filteredPhotos.map((photo, index) => (
                            <motion.div
                                key={photo.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="break-inside-avoid bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 group"
                            >
                                <div className="relative overflow-hidden">
                                    <img
                                        src={`http://localhost:5000${photo.imageUrl}`}
                                        alt={photo.title}
                                        className="w-full h-auto object-cover transform group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-6">
                                        <h3 className="text-white font-bold text-lg">{photo.title}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {filteredPhotos.length === 0 && (
                            <div className="text-center text-gray-500 py-12 col-span-full w-full">
                                No photos found in this category.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
