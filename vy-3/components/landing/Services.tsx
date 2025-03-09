"use client"
import React from 'react';
import LottieAnimation from "@/components/LottieAnimation";
import animationData from "@/public/landing/Animation2.json";
import { LightbulbIcon, Users, BookOpen } from "lucide-react";
import Link from "next/link";

const Services = () => {
    const servicesList = [
        {
            id: 1,
            title: "Startup Incubation",
            description: "Transform your ideas into viable businesses with mentorship, resources, and funding opportunities for student entrepreneurs.",
            icon: <LightbulbIcon className="text-blue-600 w-6 h-6 mt-1 mr-3 flex-shrink-0" />
        },
        {
            id: 2,
            title: "Tech Skills Development",
            description: "Learn cutting-edge technical skills through workshops, hackathons, and project-based learning experiences.",
            icon: <BookOpen className="text-blue-600 w-6 h-6 mt-1 mr-3 flex-shrink-0" />
        },
        {
            id: 3,
            title: "Networking Community",
            description: "Connect with like-minded students, successful founders, and industry professionals through our vibrant community.",
            icon: <Users className="text-blue-600 w-6 h-6 mt-1 mr-3 flex-shrink-0" />
        }
    ];

    return (
        <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full mb-4 text-sm">
                        Our Services
                    </span>
                    <h2 className="text-4xl font-bold text-blue-800 mb-4">
                        How We Help You Succeed
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto">
                        We provide comprehensive experiences designed to help you develop entrepreneurial mindset, technical skills, and valuable connections.
                    </p>
                </div>

                <div className="flex flex-col-reverse lg:flex-row items-center">
                    <div className="w-full lg:w-1/2 pr-0 lg:pr-8 mt-12 lg:mt-0">
                        <div className="space-y-6">
                            {servicesList.map(service => (
                                <div key={service.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start">
                                        {service.icon}
                                        <div>
                                            <h3 className="font-semibold text-lg text-blue-700 mb-2">{service.title}</h3>
                                            <p className="text-gray-600">{service.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <Link href="/sign-in" className="bg-blue-600 text-white px-8 py-3 rounded-lg inline-block hover:bg-blue-700 transition-colors text-lg font-medium">
                                Explore All Services
                            </Link>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex justify-center items-center">
                        <div className="w-full h-96 max-w-md">
                            <LottieAnimation animationData={animationData} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;