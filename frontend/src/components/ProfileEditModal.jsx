import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload, Save, User, Phone, Mail, GraduationCap } from 'lucide-react';

export default function ProfileEditModal({ isOpen, onClose, currentUser, onUpdate }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        qualification: '',
        parentName: '',
        parentPhone: '',
        profileImage: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
                qualification: currentUser.qualification || '',
                parentName: currentUser.parentName || '',
                parentPhone: currentUser.parentPhone || '',
                profileImage: currentUser.profileImage || ''
            });
            setPreviewImage(currentUser.profileImage ? `http://localhost:5000${currentUser.profileImage}` : null);
        }
    }, [currentUser, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let imageUrl = formData.profileImage;

            // 1. Upload Image if selected
            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append('image', imageFile);

                const token = localStorage.getItem('token');
                const uploadRes = await axios.post('/upload', uploadData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
                imageUrl = uploadRes.data;
            }

            // 2. Update User Profile
            const token = localStorage.getItem('token');
            const updateData = {
                ...formData,
                profileImage: imageUrl
            };

            const res = await axios.put(`/users/${currentUser.id}`, updateData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedUser = res.data;

            // 3. Update Local Storage
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...updatedUser }));

            // 4. Notify Parent
            onUpdate(updatedUser);
            onClose();

        } catch (err) {
            console.error("Update failed", err);
            setError(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold text-gray-800">Edit Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-2 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6">
                    {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}

                    <div className="flex justify-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-gray-100 shadow-sm bg-gray-50 flex items-center justify-center">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={40} className="text-gray-400" />
                                )}
                            </div>
                            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 cursor-pointer text-white font-medium text-xs">
                                <Upload size={16} className="mr-1" /> Change
                                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                                        readOnly // Email usually shouldn't be changed easily or requires verification
                                        title="Contact Admin to change email"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <div className="relative">
                                    <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Phone Number"
                                    />
                                </div>
                            </div>

                            {/* Staff Specific */}
                            {currentUser?.role === 'staff' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                                    <div className="relative">
                                        <GraduationCap size={18} className="absolute left-3 top-3 text-gray-400" />
                                        <input
                                            name="qualification"
                                            value={formData.qualification}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Student Specific */}
                            {currentUser?.role === 'student' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Name</label>
                                        <input
                                            name="parentName"
                                            value={formData.parentName}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone</label>
                                        <div className="relative">
                                            <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                name="parentPhone"
                                                value={formData.parentPhone}
                                                onChange={handleChange}
                                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
