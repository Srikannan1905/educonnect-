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
                            <Link to="/courses" className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-300 transition flex items-center justify-center gap-2 shadow-lg w-full sm:w-auto">
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
                                <div className="bg-yellow-400 p-3 rounded-full"><Award size={32} className="text-blue-900" /></div>
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
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why Choose Us?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">We provide a comprehensive learning experience tailored to your needs.</p>
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
                <section className="py-20 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Meet Our Experts</h2>
                            <p className="text-gray-600 max-w-2xl mx-auto">Learn from the best minds in the industry.</p>
                        </div>
                        <div className="grid md:grid-cols-4 gap-8">
                            {instructors.map(inst => (
                                <div key={inst.id} className="bg-white p-6 rounded-xl shadow-lg text-center hover:-translate-y-2 transition duration-300">
                                    <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-100">
                                        {inst.profileImage ? (
                                            <img src={`http://localhost:5000${inst.profileImage}`} alt={inst.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                <Users size={32} className="text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-800">{inst.name}</h3>
                                    <p className="text-blue-600 text-sm font-medium mb-2">{inst.qualification || 'Instructor'}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Testimonials */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">What Our Students Say</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="This platform changed my career path completely. Highly recommended!"
                            author="Sarah J."
                            role="Software Engineer"
                        />
                        <TestimonialCard
                            quote="The instructors are amazing and the content is top-notch."
                            author="Mike T."
                            role="Data Analyst"
                        />
                        <TestimonialCard
                            quote="Flexible learning hours helped me balance work and study."
                            author="Emily R."
                            role="Product Manager"
                        />
                    </div>
                </div>
            </section>

            <WhatsAppButton />
        </div>
    );
}

function FeatureCard({ icon, title, desc }) {
    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="bg-white p-8 rounded-xl shadow-lg border border-gray-100/50 hover:shadow-xl transition"
        >
            <div className="mb-6 bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center">{icon}</div>
            <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
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

function TestimonialCard({ quote, author, role }) {
    return (
        <div className="bg-gray-50 p-8 rounded-xl border border-gray-100">
            <div className="text-yellow-400 flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <p className="text-gray-700 italic mb-6">"{quote}"</p>
            <div>
                <h4 className="font-bold text-gray-900">{author}</h4>
                <p className="text-gray-500 text-sm">{role}</p>
            </div>
        </div>
    );
}

// WhatsApp Floating Button Component
function WhatsAppButton() {
    const [whatsappNumber, setWhatsappNumber] = useState('917871444323'); // Default

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await axios.get('/company');
                if (res.data.whatsappNumber) {
                    setWhatsappNumber(res.data.whatsappNumber);
                }
            } catch (err) {
                // Keep default on error
                console.error("Failed to fetch WhatsApp number");
            }
        };
        fetchSettings();
    }, []);

    return (
        <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition hover:scale-110 flex items-center justify-center"
            title="Chat with us on WhatsApp"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="currentColor"
                viewBox="0 0 16 16"
            >
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
            </svg>
        </a>
    );
}
