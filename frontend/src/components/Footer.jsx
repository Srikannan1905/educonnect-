import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook } from 'lucide-react';

export default function Footer() {
    const [company, setCompany] = useState(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await axios.get('http://localhost:5000/api/company');
                setCompany(res.data);
            } catch (err) {
                console.error("Failed to fetch company settings for footer");
            }
        };
        fetchSettings();
    }, []);

    if (!company) return null;

    return (
        <footer className="bg-gray-900 text-white pt-16 pb-8">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Description */}
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-blue-400">{company.name || 'EduConnect'}</h3>
                        <p className="text-gray-400 leading-relaxed mb-6">
                            Empowering students with expert-led courses and personalized learning paths. Join us to shape your future.
                        </p>
                        <div className="flex gap-4">
                            {company.instagramUrl && (
                                <a href={company.instagramUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-pink-600 transition">
                                    <Instagram size={20} />
                                </a>
                            )}
                            {company.twitterUrl && (
                                <a href={company.twitterUrl} target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-2 rounded-full hover:bg-blue-400 transition">
                                    <Twitter size={20} />
                                </a>
                            )}
                            {/* Placeholder for Facebook if needed, or mapped from generic socials */}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b-2 border-blue-500 inline-block pb-1">Quick Links</h4>
                        <ul className="space-y-3">
                            <li><Link to="/" className="text-gray-400 hover:text-white transition hover:translate-x-1 inline-block">Home</Link></li>
                            <li><Link to="/courses" className="text-gray-400 hover:text-white transition hover:translate-x-1 inline-block">Courses</Link></li>
                            <li><Link to="/gallery" className="text-gray-400 hover:text-white transition hover:translate-x-1 inline-block">Gallery</Link></li>
                            <li><Link to="/login" className="text-gray-400 hover:text-white transition hover:translate-x-1 inline-block">Login</Link></li>
                            <li><Link to="/register" className="text-gray-400 hover:text-white transition hover:translate-x-1 inline-block">Register</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b-2 border-blue-500 inline-block pb-1">Contact Us</h4>
                        <ul className="space-y-4">
                            {company.address && (
                                <li className="flex items-start gap-3 text-gray-400">
                                    <MapPin size={20} className="mt-1 text-blue-400 shrink-0" />
                                    <span>{company.address}</span>
                                </li>
                            )}
                            {company.phone && (
                                <li className="flex items-center gap-3 text-gray-400">
                                    <Phone size={20} className="text-blue-400 shrink-0" />
                                    <span>{company.phone}</span>
                                </li>
                            )}
                            {company.email && (
                                <li className="flex items-center gap-3 text-gray-400">
                                    <Mail size={20} className="text-blue-400 shrink-0" />
                                    <span>{company.email}</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Google Map */}
                    <div>
                        <h4 className="text-lg font-bold mb-6 border-b-2 border-blue-500 inline-block pb-1">Locate Us</h4>
                        <div className="bg-gray-800 rounded-lg overflow-hidden h-48 w-full relative">
                            {company.googleMapEmbedUrl ? (
                                <iframe
                                    src={company.googleMapEmbedUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Google Map Location"
                                ></iframe>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-500 text-sm p-4 text-center">
                                    Map location not set by Admin
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} {company.name || 'EduConnect'}. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
