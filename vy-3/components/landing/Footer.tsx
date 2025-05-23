"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Lock } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-blue-100">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and About */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="inline-block mb-4">
                            <Image
                                src="/logo.png"
                                alt="Lurnex Logo"
                                width={120}
                                height={40}
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-gray-600 text-sm mb-4">
                            Empowering students through entrepreneurship, technology, and community.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-blue-600 hover:text-blue-800">
                                <Facebook size={18} />
                            </Link>
                            <Link href="#" className="text-blue-600 hover:text-blue-800">
                                <Twitter size={18} />
                            </Link>
                            <Link href="#" className="text-blue-600 hover:text-blue-800">
                                <Instagram size={18} />
                            </Link>
                            <Link href="#" className="text-blue-600 hover:text-blue-800">
                                <Linkedin size={18} />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h3 className="font-semibold text-blue-800 mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="text-gray-600 hover:text-blue-600">About Us</Link></li>
                            <li><Link href="/courses" className="text-gray-600 hover:text-blue-600">Courses</Link></li>
                            <li><Link href="/events" className="text-gray-600 hover:text-blue-600">Events</Link></li>
                            <li><Link href="/blog" className="text-gray-600 hover:text-blue-600">Blog</Link></li>
                            <li><Link href="/contact" className="text-gray-600 hover:text-blue-600">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div className="col-span-1">
                        <h3 className="font-semibold text-blue-800 mb-4">Resources</h3>
                        <ul className="space-y-2">
                            <li><Link href="/resources/startup-guide" className="text-gray-600 hover:text-blue-600">Startup Guide</Link></li>
                            <li><Link href="/resources/tech-tutorials" className="text-gray-600 hover:text-blue-600">Tech Tutorials</Link></li>
                            <li><Link href="/resources/mentorship" className="text-gray-600 hover:text-blue-600">Mentorship</Link></li>
                            <li><Link href="/resources/funding" className="text-gray-600 hover:text-blue-600">Funding Opportunities</Link></li>
                            <li><Link href="/faq" className="text-gray-600 hover:text-blue-600">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-1">
                        <h3 className="font-semibold text-blue-800 mb-4">Contact Us</h3>
                        <ul className="space-y-2">
                            <li className="flex items-start">
                                <Mail size={16} className="text-blue-600 mr-2 mt-1 flex-shrink-0" />
                                <a href="mailto:2300032870@kluniversity.in" className="text-gray-600 hover:text-blue-600">2300032870@kluniveristy.in</a>
                            </li>
                            <li className="text-gray-600 mt-4">
                                KL University, <br />
                                Student Academy Center. <br />
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-blue-100 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-600 text-sm">
                        © {currentYear} VLearn. All rights reserved.
                    </p>
                    <div className="mt-4 md:mt-0 space-x-6 flex items-center">
                        <Link href="/privacy" className="text-sm text-gray-600 hover:text-blue-600">Privacy Policy</Link>
                        <Link href="/terms" className="text-sm text-gray-600 hover:text-blue-600">Terms of Service</Link>
                        <Link href="/admin/sign-in" className="text-sm text-gray-600 hover:text-blue-600 flex items-center ml-4">
                            <Lock size={14} className="mr-1" /> Admin Login
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
export default Footer;