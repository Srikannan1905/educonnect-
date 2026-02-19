import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Edit, Plus, X, Check } from 'lucide-react';

export default function CourseManager() {
    const [courses, setCourses] = useState([]);
    const [centers, setCenters] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCourse, setCurrentCourse] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subject: '',
        board: 'CBSE',
        mode: 'Online',
        price: '',
        duration: '',
        description: '',
        centerId: '',
    });

    useEffect(() => {
        fetchCourses();
        fetchCenters();
    }, []);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get('/courses');
            setCourses(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCenters = async () => {
        try {
            const res = await axios.get('/centers');
            setCenters(res.data);
        } catch (err) {
            console.error("Failed to fetch centers", err);
        }
    }

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this course?')) {
            try {
                await axios.delete(`/courses/${id}`, getAuthHeader());
                fetchCourses();
            } catch (err) {
                alert('Failed to delete course');
            }
        }
    };

    const handleEdit = (course) => {
        setCurrentCourse(course);
        setFormData({
            title: course.title,
            subject: course.subject,
            board: course.board,
            mode: course.mode,
            price: course.price || '',
            duration: course.duration || '',
            description: course.description || '',
            thumbnail: course.thumbnail || '',
            centerId: course.centerId || (centers.length > 0 ? centers[0].id : ''),
        });
        setIsModalOpen(true);
    };

    const handleAdd = () => {
        setCurrentCourse(null);
        setFormData({
            title: '',
            subject: '',
            board: 'CBSE',
            mode: 'Online',
            price: '',
            duration: '',
            description: '',
            thumbnail: '',
            centerId: centers.length > 0 ? centers[0].id : '',
        });
        setIsModalOpen(true);
    };

    const [uploading, setUploading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.centerId && centers.length === 0) {
            alert("No centers available to assign course to.");
            return;
        }

        let thumbnailUrl = formData.thumbnail;

        // Handle Image Upload if file selected
        if (formData.file) {
            setUploading(true);
            const uploadData = new FormData();
            uploadData.append('image', formData.file);
            const token = localStorage.getItem('token');
            try {
                const uploadRes = await axios.post('/upload', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
                });
                thumbnailUrl = uploadRes.data;
            } catch (err) {
                alert('Failed to upload image');
                setUploading(false);
                return;
            }
            setUploading(false);
        }

        const dataToSend = {
            ...formData,
            thumbnail: thumbnailUrl,
            centerId: formData.centerId || (centers[0]?.id)
        };
        // Remove file object before sending to API
        delete dataToSend.file;

        try {
            if (currentCourse) {
                await axios.put(`/courses/${currentCourse.id}`, dataToSend, getAuthHeader());
            } else {
                await axios.post('/courses', dataToSend, getAuthHeader());
            }
            setIsModalOpen(false);
            fetchCourses();
        } catch (err) {
            console.error(err);
            alert('Failed to save course: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Courses</h2>
                <button onClick={handleAdd} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-green-700">
                    <Plus size={20} /> Add Course
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b">
                        <tr>
                            <th className="p-4">Title</th>
                            <th className="p-4">Subject</th>
                            <th className="p-4">Board</th>
                            <th className="p-4">Mode</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id} className="border-b hover:bg-gray-50">
                                <td className="p-4 font-medium">{course.title}</td>
                                <td className="p-4">{course.subject}</td>
                                <td className="p-4">{course.board}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${course.mode === 'Online' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {course.mode}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-3">
                                    <button onClick={() => handleEdit(course)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                                    <button onClick={() => handleDelete(course.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{currentCourse ? 'Edit Course' : 'Add Course'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-black"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input type="text" placeholder="Course Title" required className="w-full p-2 border rounded" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />

                            {/* Thumbnail Upload */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Course Thumbnail</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="w-full p-2 border rounded bg-gray-50"
                                    onChange={e => setFormData({ ...formData, file: e.target.files[0] })}
                                />
                                {formData.thumbnail && !formData.file && (
                                    <div className="mt-2 text-xs text-gray-500">Current: {formData.thumbnail}</div>
                                )}
                            </div>

                            {/* Center Selection */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Center</label>
                                <select className="w-full p-2 border rounded" value={formData.centerId} onChange={e => setFormData({ ...formData, centerId: e.target.value })} required>
                                    <option value="">Select Center</option>
                                    {centers.map(center => (
                                        <option key={center.id} value={center.id}>{center.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" placeholder="Subject" required className="w-full p-2 border rounded" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
                                <input type="number" placeholder="Price (₹)" className="w-full p-2 border rounded" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Duration (Minutes)</label>
                                <input
                                    type="number"
                                    placeholder="e.g., 60 (Leave empty for Lifetime)"
                                    className="w-full p-2 border rounded"
                                    value={formData.duration}
                                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                />
                                <p className="text-xs text-gray-500 mt-1">Set to <b>60</b> for 1 hour access. Users can repurchase after expiry.</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <select className="w-full p-2 border rounded" value={formData.board} onChange={e => setFormData({ ...formData, board: e.target.value })}>
                                    <option value="CBSE">CBSE</option>
                                    <option value="ICSE">ICSE</option>
                                    <option value="TN">State Board</option>
                                    <option value="Other">Other</option>
                                </select>
                                <select className="w-full p-2 border rounded" value={formData.mode} onChange={e => setFormData({ ...formData, mode: e.target.value })}>
                                    <option value="online">Online</option>
                                    <option value="offline">Offline</option>
                                </select>
                            </div>
                            <textarea placeholder="Description" className="w-full p-2 border rounded h-24" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Save Course</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
