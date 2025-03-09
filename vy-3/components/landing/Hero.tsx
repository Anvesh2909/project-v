"use client"
import React from 'react';
import LottieAnimation from "@/components/LottieAnimation";
import animatedData1 from "@/public/landing/Animation1.json";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Hero = () => {
    return (
        <section className="pt-16 mt-10">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-full lg:w-1/2 text-center lg:text-left">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full mb-4 text-sm">
                            Limited-time enrollment open
                        </span>
                        <h1 className="text-4xl font-bold mb-4">
                            Transform your future with our exclusive club courses
                        </h1>
                        <p className="text-lg text-gray-600 mb-6">
                            Discover the hidden curriculum our top members use to accelerate their skills.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <Link href="/enroll" className="bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center">
                                Start Your Journey
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                            <Link href="/sign-in" className="border border-gray-300 px-6 py-2 rounded-lg">
                                Access My Courses
                            </Link>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2">
                        <div className="w-full h-80 md:h-96">
                            <LottieAnimation animationData={animatedData1} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Hero;