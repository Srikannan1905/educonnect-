import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Clock, Users, ArrowRight, Star, Check, Calendar, CreditCard, X, ChevronRight } from 'lucide-react';
import { NavControls } from '../components/ui/DashCards';
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
  const [demoTime, setDemoTime] = useState('09:00');
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
        date: demoDate,
        startTime: demoTime
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
    navigate(`/payment?courseId=${courseId}`);
  };

  const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || course.subject === filter;
    return matchesSearch && matchesFilter;
  });

  const subjects = ['All', ...new Set((Array.isArray(courses) ? courses : []).filter(c => c.subject).map(c => c.subject))];

  return (
    <div className="container mx-auto p-6 md:p-12 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:block">
            <NavControls />
          </div>
          <div>
            <h2 className="text-4xl font-black text-white mb-2 leading-tight">Explore Courses</h2>
            <p className="text-slate-400 font-medium">Find the perfect course to upgrade your skills.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-16 pr-6 py-3 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-full text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner w-full sm:w-64"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-16 pr-10 py-3 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 rounded-full text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner w-full sm:w-48"
            >
              {subjects.map(subject => <option key={subject} value={subject} className="bg-slate-900">{subject}</option>)}
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none rotate-90" size={16} />
          </div>
        </div>
      </div>

      {loading ? (
        <Loader size={48} className="h-64" />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.length === 0 && <p className="col-span-full text-center text-slate-400 text-lg">No courses found matching your criteria.</p>}
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[2.5rem] border border-white/5 overflow-hidden hover:shadow-[0_40px_60px_-12px_rgba(0,0,0,0.5)] transition duration-500 flex flex-col group"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white relative overflow-hidden">
                {course.thumbnail ? (
                  <img src={`http://localhost:5000${course.thumbnail}`} alt={course.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                ) : (
                  <BookOpen size={56} className="transform group-hover:scale-110 transition duration-500 opacity-50" />
                )}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-white/10 z-10">
                  {course.mode}
                </div>
              </div>

              <div className="p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-4 py-1.5 rounded-full uppercase tracking-widest">{course.subject}</span>
                </div>
                <h3 className="text-2xl font-black mb-3 text-slate-200 group-hover:text-blue-400 transition">{course.title}</h3>
                <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">{course.description}</p>

                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/5 rounded-xl text-slate-400"><Clock size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Duration</p>
                    <p className="text-sm font-bold text-slate-300">{course.duration ? `${course.duration} mins` : 'Flexible'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => openDemoModal(course)}
                    className="bg-white/5 text-slate-400 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition flex items-center justify-center gap-2 border border-white/5"
                  >
                    <Calendar size={16} /> Demo
                  </button>
                  <button
                    onClick={() => handleBookCourse(course.id)}
                    className="bg-blue-600 text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95"
                  >
                    <BookOpen size={16} /> Book Course
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0b0f19] border border-white/10 shadow-3xl rounded-[2.5rem] max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter">Book Demo Class</h3>
                <p className="text-blue-100 text-xs font-medium uppercase tracking-widest opacity-80 mt-1">Select your slot</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-2xl transition"><X size={20} /></button>
            </div>
            <div className="p-8">
              <p className="text-slate-400 mb-8 font-medium">Select a convenient time for your demo class for <span className="font-black text-blue-400">{selectedCourse?.title}</span>.</p>

              <form onSubmit={confirmBooking}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      value={demoDate}
                      onChange={(e) => setDemoDate(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner font-bold"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                      type="time"
                      required
                      value={demoTime}
                      onChange={(e) => setDemoTime(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition shadow-inner font-bold"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition flex justify-center items-center gap-3 shadow-2xl shadow-blue-500/30 active:scale-95">
                  <Calendar size={18} /> Confirm Booking
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
