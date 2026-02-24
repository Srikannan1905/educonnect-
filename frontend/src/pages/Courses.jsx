
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Calendar, CreditCard, Search, Filter, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import Loader from '../components/ui/Loader';


export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = JSON.parse(localStorage.getItem('user'));

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [demoDate, setDemoDate] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await axios.get('/courses');
        if (Array.isArray(res.data)) {
          setCourses(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
        addToast('Failed to load courses', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const openDemoModal = (course) => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return addToast('Only students can book demos.', 'error');
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  async function confirmBooking(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/bookings/demo', {
        courseId: selectedCourse.id,
        date: demoDate
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Demo Class Booked Successfully!', 'success');
      setIsModalOpen(false);
      setDemoDate('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Booking failed', 'error');
    }
  };

  const handleBookCourse = (courseId) => {
    if (!user) return navigate('/login');
    if (user.role !== 'student') return addToast('Only students can book courses.', 'error');
    // For now, since it's direct booking without payment, we can just confirmed it or go to a booking detail page
    // Here we'll treat it as a direct "Enrollment" for now or a visit request
    addToast('Course Booking Request Sent!', 'success');
  };

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || course.subject === filter;
    return matchesSearch && matchesFilter;
  });

  const subjects = ['All', ...new Set((Array.isArray(courses) ? courses : []).filter(c => c.subject).map(c => c.subject))];

  return (
    <div className="container mx-auto p-6 md:p-12 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">Explore Courses</h2>
          <p className="text-gray-500">Find the perfect course to upgrade your skills.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 border rounded-full w-full sm:w-64 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-8 py-3 border rounded-full appearance-none bg-white w-full sm:w-48 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            >
              {subjects.map(subject => <option key={subject} value={subject}>{subject}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader size={48} className="h-64" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length === 0 && <p className="col-span-full text-center text-gray-500 text-lg">No courses found matching your criteria.</p>}
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition duration-300 flex flex-col group"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white relative overflow-hidden">
                {course.thumbnail ? (
                  <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover transition duration-300 group-hover:scale-110" />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition"></div>
                    <BookOpen size={56} className="transform group-hover:scale-110 transition duration-300" />
                  </>
                )}
                <div className="absolute top-4 right-4 bg-white/90 text-blue-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm shadow-sm z-10">
                  {course.mode}
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-blue-600 font-semibold text-sm bg-blue-50 px-3 py-1 rounded-full">{course.subject}</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">{course.description}</p>

                <div className="flex items-center gap-2 mb-6 text-gray-400 text-xs font-bold uppercase tracking-tighter">
                  <Clock size={14} /> <span>{course.duration ? `${course.duration} mins` : 'Flexible Duration'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => openDemoModal(course)}
                    className="border-2 border-blue-600 text-blue-600 py-2.5 rounded-xl font-bold hover:bg-blue-50 flex items-center justify-center gap-2 text-sm transition"
                  >
                    <Calendar size={18} /> Demo
                  </button>
                  <button
                    onClick={() => handleBookCourse(course.id)}
                    className="bg-blue-600 text-white py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center justify-center gap-2 text-sm shadow-lg shadow-blue-200 transition"
                  >
                    <BookOpen size={18} /> Book Course
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">Book Demo Class</h3>
              <button onClick={() => setIsModalOpen(false)} className="hover:bg-blue-700 p-1 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">Select a convenient time for your demo class for <span className="font-bold text-gray-800">{selectedCourse?.title}</span>.</p>

              <form onSubmit={confirmBooking}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date & Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="datetime-local"
                      required
                      min={new Date().toISOString().slice(0, 16)}
                      value={demoDate}
                      onChange={(e) => setDemoDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition flex justify-center items-center gap-2">
                  <Calendar size={20} /> Confirm Booking
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
