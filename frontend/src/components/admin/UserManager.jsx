import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Shield, User, Edit } from 'lucide-react';

export default function UserManager({ role }) {
    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, [role]);

    async function fetchUsers() {
        setLoading(true);
        setError('');
        try {
            const url = role ? `/users?role=${role}` : '/users';
            console.log(`[DEBUG] Fetching users from ${url}`);
            const token = localStorage.getItem('token');
            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`[DEBUG] Users received:`, res.data);
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    async function handleDelete(id) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/users/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchUsers();
            } catch (err) {
                const message = err.response?.data?.message || 'Failed to delete user';
                alert(message);
            }
        }
    };


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        qualification: '',
        profileImage: '',
    });

    const handleEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            name: user.name,
            qualification: user.qualification || '',
            profileImage: user.profileImage || '',
        });
        setIsModalOpen(true);
    };

    async function handleUpdate(e) {
        e.preventDefault();
        setUploading(true);
        let profileImageUrl = formData.profileImage;

        // Handle Image Upload
        if (formData.file) {
            const uploadData = new FormData();
            uploadData.append('image', formData.file);
            const token = localStorage.getItem('token');
            try {
                const uploadRes = await axios.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
                });
                profileImageUrl = uploadRes.data;
            } catch {
                alert('Failed to upload image');
                setUploading(false);
                return;
            }
        }

        try {
            const token = localStorage.getItem('token');
            const dataToSend = {
                ...formData,
                profileImage: profileImageUrl
            };
            delete dataToSend.file;

            await axios.put(`/users/${currentUser.id}`, dataToSend, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsModalOpen(false);
            fetchUsers();
        } catch {
            alert('Failed to update user');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;
    if (error) return (
        <div className="p-8 text-center">
            <div className="text-red-500 mb-2">Error: {error}</div>
            <button onClick={fetchUsers} className="bg-blue-600 text-white px-4 py-2 rounded">Retry</button>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold capitalize">{role || 'All'} Users</h2>
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold">
                    Total: {users.length}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4">Name</th>
                            <th className="p-4">Email</th>
                            {!role && <th className="p-4">Role</th>}
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(Array.isArray(users) ? users : []).map((user) => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium flex items-center gap-3">
                                    {user.profileImage ? (
                                        <img src={`http://localhost:5000${user.profileImage}`} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <div className="bg-gray-200 p-2 rounded-full"><User size={20} /></div>
                                    )}
                                    <div>
                                        <div className="font-semibold">{user.name}</div>
                                        {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-600">
                                    {user.email}
                                    {user.qualification && <div className="text-xs text-gray-400 mt-1">{user.qualification}</div>}
                                </td>
                                {!role && (
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'staff' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {user.role === 'admin' && <Shield size={12} />}
                                            {user.role}
                                        </span>
                                    </td>
                                )}
                                <td className="p-4 flex gap-2">
                                    {(user.role === 'staff' || user.role === 'admin') && (
                                        <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800" title="Edit User">
                                            <Edit size={18} />
                                        </button>
                                    )}
                                    {user.role !== 'admin' && (
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800" title="Delete User">
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && <div className="p-8 text-center text-gray-500">No {role || 'users'} found.</div>}
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Edit {currentUser?.role}</h3>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Qualification</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={formData.qualification}
                                    onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Profile Photo</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-2 border rounded bg-gray-50"
                                    onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                                />
                                {formData.profileImage && !formData.file && (
                                    <div className="mt-2 text-xs text-gray-500">Current photo available</div>
                                )}
                            </div>
                            <div className="flex gap-2 justify-end mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                                    {uploading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
