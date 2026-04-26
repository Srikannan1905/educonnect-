import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { BookOpen, Users, Award, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

import axios from "axios";


export default function Home() {
    const [instructors, setInstructors] = useState([]);

    useEffect(() => {
        async function fetchInstructors() {
            try {
                // Fetch users with role 'staff' (instructors)
                // Note: The public API might need adjustment if /api/users is protected. 
                // We'll try to fetch from a public endpoint if available, but currently /api/users is protected/admin only.
                // However, usually "Our Team" is public data. 
                // I'll assume for now I need to create a public endpoint or use the filtered one if I relaxed security.
                // Wait, userController.js has: 
                // if (req.user.role === 'staff' && role !== 'student') ...
                // It requires authentication. 
                // I should create a public endpoint for fetching instructors in userController.js or modify the existing one.
                // For now, I'll add the UI code, but I know it might fail without a token.
                // Actually, Home page is public. I can't send a token.
                // I MUST update userController.js/userRoutes.js to allow public access to list staff.

                // Let's create a new route /api/public/instructors or similar.
                // For now, I'll just write the fetch logic and I will fix the backend in the next step.
                const res = await axios.get('/users/public/instructors');
                if (Array.isArray(res.data)) {
                    setInstructors(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch instructors");
            }
        };
        fetchInstructors();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
                            Master Your Future with <span className="text-yellow-300">EduConnect</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-lg">
                            Join thousands of students achieving their dreams with our expert-led courses and personalized learning paths.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            <Link to="/courses" className="bg-yellow-400 text-blue-300 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto">
                                Explore Courses <ArrowRight size={20} />
                            </Link>
                            <Link to="/register" className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition flex items-center justify-center w-full sm:w-auto">
                                Get Started
                            </Link>
                        </div>
                        <div className="mt-8">
                            <Link to="/staff-register" className="inline-flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium transition hover:underline">
                                <Users size={16} /> Interested in Teaching? Join as Staff
                            </Link>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex justify-center"
                    >
                        {/* Placeholder for a hero image or 3D element */}
                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl max-w-sm w-full">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="bg-yellow-400 p-3 rounded-full"><Award size={32} className="text-blue-300" /></div>
                                <div>
                                    <h3 className="font-bold text-xl">#1 Learning Platform</h3>
                                    <p className="text-blue-100 text-sm">Voted by Students</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-2 bg-white/20 rounded-full w-3/4"></div>
                                <div className="h-2 bg-white/20 rounded-full w-full"></div>
                                <div className="h-2 bg-white/20 rounded-full w-5/6"></div>
                            </div>
                            <div className="mt-6 flex items-center gap-2 text-yellow-300 font-bold">
                                <Star fill="currentColor" /> 4.9/5 Rating
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-transparent">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-200 mb-4">Why Choose Us?</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">We provide a comprehensive learning experience tailored to your needs.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<BookOpen size={40} className="text-blue-600" />}
                            title="Expert Curriculum"
                            desc="Courses designed by industry experts to help you stay ahead."
                        />
                        <FeatureCard
                            icon={<Users size={40} className="text-purple-600" />}
                            title="Interactive Learning"
                            desc="Engage with instructors and peers in live sessions and forums."
                        />
                        <FeatureCard
                            icon={<Award size={40} className="text-green-600" />}
                            title="Certified Success"
                            desc="Earn certificates recognized by top employers worldwide."
                        />
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-blue-900 text-white">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <StatItem number="10k+" label="Students" />
                    <StatItem number="500+" label="Courses" />
                    <StatItem number="100+" label="Instructors" />
                    <StatItem number="4.9" label="Rating" />
                </div>
            </section>

            {/* Instructors Section */}
            {instructors.length > 0 && (
                <section className="py-20 bg-transparent">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-200 mb-4">Meet Our Experts</h2>
                            <p className="text-slate-400 max-w-2xl mx-auto">Learn from the best minds in the industry.</p>
                        </div>
                        <div className="grid md:grid-cols-4 gap-8">
                            {instructors.map(inst => (
                                <div key={inst.id} className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-6 rounded-xl shadow-lg text-center hover:-translate-y-2 transition duration-300">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-100">
                                        {inst.profileImage ? (
                                            <img src={`${import.meta.env.VITE_API_URL}${inst.profileImage}`} alt={inst.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <Users size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-200">{inst.name}</h3>
                                    <p className="text-blue-600 text-sm font-medium mb-2">{inst.qualification || 'Instructor'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="py-20 bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="The flexibility allows me to learn at my own pace. I can revisit the high-quality materials anytime, which is perfect for balancing with my full-time job."
                        />
                        <TestimonialCard
                            quote="Having access to specialized skills and expert instructors from around the world has completely transformed my career trajectory. The structured courses are incredibly easy to follow."
                        />
                        <TestimonialCard
                            quote="The interactive quizzes and responsive feedback from professors make the learning process engaging. It's much better than just passively watching videos!"
                        />
                    </div>
                </div>
            </section>

        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="bg-[#1e293b]/80 backdrop-blur-xl border border-white/10 shadow-2xl p-8 rounded-xl shadow-lg border border-gray-100/50 hover:shadow-xl transition"
        >
            <div className="mb-6 bg-transparent w-16 h-16 rounded-full flex items-center justify-center">{icon}</div>
            <h3 className="text-xl font-bold mb-3 text-slate-200">{title}</h3>
            <p className="text-slate-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function StatItem({ number, label }) {
    return (
        <div>
            <div className="text-4xl font-extrabold mb-2 text-yellow-400">{number}</div>
            <div className="text-blue-200 uppercase tracking-wider text-sm font-semibold">{label}</div>
        </div>
    );
}

function TestimonialCard({ quote }) {
    return (
        <div className="bg-transparent p-8 rounded-xl border border-white/5">
            <div className="text-yellow-400 flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="text-slate-300 italic mb-6">"{quote}"</p>
        </div>
    );
}
