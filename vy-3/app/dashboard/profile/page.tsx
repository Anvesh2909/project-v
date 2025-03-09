"use client";
import React, {useContext} from 'react';
import {
    Mail,
    Book,
    Calendar,
    Award,
    Activity,
    Rocket,
    Target,
    Gem,
    BookOpen,
    LineChart,
    BadgeCheck,
    Globe,
    Trophy,
    ShieldCheck,
    Medal,
    Users,
    Clock
} from 'lucide-react';
import Image from "next/image";
import {AppContext} from "@/context/AppContext";
import Link from "next/link";

const ProfilePage = () => {
    const context = useContext(AppContext);
    const data = context?.data;
    const year = data?.createdAt.toString().slice(0, 4);
    const studentData = {
        name: data?.name || "John Doe",
        role: data?.role,
        email: data?.email,
        enrollmentYear: year,
        major: data?.branch?.toUpperCase() || "Computer Science",
        gpa: data?.cgpa,
        totalPoints: data?.silPoints || 0,
        silProgress: data?.silPoints || 0,
        silTarget: 1000,
        clubsJoined: [
            {
                name: "Coding Club",
                role: "Member",
                joinedDate: "Oct 2023",
                meetings: "Every Wednesday 3 PM"
            },
            {
                name: "Robotics Club",
                role: "Active Member",
                joinedDate: "Nov 2023",
                meetings: "Bi-weekly Fridays"
            }
        ],
        currentCourses: [
            {
                name: "Advanced Web Development",
                progress: 65,
                points: 230,
                deadline: "Mar 2024"
            },
            {
                name: "Data Structures",
                progress: 40,
                points: 150,
                deadline: "Apr 2024"
            }
        ],
        achievements: [
            {
                title: "Club Champion",
                type: "participation",
                points: 100
            },
            {
                title: "Project Showcase Winner",
                type: "competition",
                points: 200
            },
            {
                title: "Outstanding Contribution",
                type: "community",
                points: 150
            }
        ],
        img: data?.image || '/assets/profile_img2.png',
        badges: [
            {
                title: "Coding Expert",
                description: "Completed 5 coding challenges",
                icon: <Trophy className="w-8 h-8" />,
                earnedDate: "Dec 2023",
                category: "coding"
            },
            {
                title: "Club Regular",
                description: "Attended 10 consecutive meetings",
                icon: <Users className="w-8 h-8" />,
                earnedDate: "Jan 2024",
                category: "attendance"
            },
            {
                title: "Project Master",
                description: "Led 3 successful club projects",
                icon: <Rocket className="w-8 h-8" />,
                earnedDate: "Feb 2024",
                category: "leadership"
            },
            {
                title: "Knowledge Sharer",
                description: "Conducted 5 peer learning sessions",
                icon: <BookOpen className="w-8 h-8" />,
                earnedDate: "Mar 2024",
                category: "mentorship"
            }
        ],
        upcomingEvents: [
            {
                name: "Python Workshop",
                date: "Apr 15, 2024",
                time: "3:00 PM - 5:00 PM",
                club: "Coding Club"
            },
            {
                name: "Robotics Competition",
                date: "Apr 22, 2024",
                time: "10:00 AM - 4:00 PM",
                club: "Robotics Club"
            }
        ]
    };



    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-800">My Profile</h1>
                        <p className="text-gray-500 mt-1">Club Points: {studentData.silProgress}/{studentData.silTarget}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Rocket className="w-6 h-6 text-blue-500" />
                        <Gem className="w-6 h-6 text-blue-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Info */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-blue-200">
                                    <Image
                                        src={studentData.img}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="rounded-full object-cover"
                                        unoptimized
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-blue-800">{studentData.name}</h2>
                                <p className="text-gray-500">{studentData.role}</p>

                                <div className="w-full mt-6 space-y-3">
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Mail className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">{studentData.email}</span>
                                    </div>
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Book className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">{studentData.major}</span>
                                    </div>
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">Joined {studentData.enrollmentYear}</span>
                                    </div>
                                </div>
                                <Link href="/dashboard/profile/update" className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
                                    Update Profile
                                </Link>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex items-center mb-4">
                                <Target className="w-5 h-5 mr-2 text-blue-500" />
                                <h3 className="text-lg font-semibold text-blue-800">Club Engagement</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-blue-800">{studentData.silProgress} Points</span>
                                    <span className="text-gray-500">{studentData.silTarget} Target</span>
                                </div>
                                <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full"
                                        style={{ width: `${(studentData.silProgress / studentData.silTarget) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex items-center mb-4">
                                <Clock className="w-5 h-5 mr-2 text-blue-500" />
                                <h3 className="text-lg font-semibold text-blue-800">Upcoming Events</h3>
                            </div>
                            <div className="space-y-4">
                                {studentData.upcomingEvents.map((event, index) => (
                                    <div key={index} className="bg-blue-50 rounded-lg p-4 hover:bg-blue-100 transition-all duration-300">
                                        <h4 className="font-medium text-blue-800">{event.name}</h4>
                                        <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                                        <p className="text-sm text-gray-600">{event.time}</p>
                                        <p className="text-xs text-blue-500 mt-2">{event.club}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Active Courses */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <BookOpen className="w-6 h-6 mr-2 text-blue-500" />
                                    <h2 className="text-xl font-bold text-blue-800">Enrolled Courses</h2>
                                </div>
                                <span className="text-gray-500">Current Term</span>
                            </div>
                            <div className="space-y-4">
                                {studentData.currentCourses.map((course, index) => (
                                    <div key={index} className="bg-blue-50 rounded-lg p-4 group hover:bg-blue-100 transition-all duration-300">
                                        <div className="flex justify-between mb-2">
                                            <h3 className="text-blue-800">{course.name}</h3>
                                            <span className="text-blue-500 text-sm">{course.deadline}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="flex-1 mr-4">
                                                <div className="h-2 bg-blue-200 rounded-full">
                                                    <div
                                                        className="h-2 bg-blue-500 rounded-full"
                                                        style={{ width: `${course.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <span className="text-blue-600">{course.progress}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                                <div className="flex items-center mb-2">
                                    <LineChart className="w-5 h-5 mr-2 text-blue-500" />
                                    <span className="text-gray-500">Rating</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-800">{studentData.gpa}</div>
                                <div className="text-gray-500 text-sm">+0.3 from last month</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                                <div className="flex items-center mb-2">
                                    <Activity className="w-5 h-5 mr-2 text-blue-500" />
                                    <span className="text-gray-500">Total Points</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-800">{studentData.totalPoints}</div>
                                <div className="text-gray-500 text-sm">Rank: #42 in Clubs</div>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-blue-100">
                                <div className="flex items-center mb-2">
                                    <BadgeCheck className="w-5 h-5 mr-2 text-blue-500" />
                                    <span className="text-gray-500">Achievements</span>
                                </div>
                                <div className="text-3xl font-bold text-blue-800">{studentData.achievements.length}</div>
                                <div className="text-gray-500 text-sm">450 Points earned</div>
                            </div>
                        </div>

                        {/* Club Engagements */}
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <Globe className="w-6 h-6 mr-2 text-blue-500" />
                                    <h2 className="text-xl font-bold text-blue-800">My Clubs</h2>
                                </div>
                                <span className="text-gray-500">{studentData.clubsJoined.length} Active Memberships</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {studentData.clubsJoined.map((club, index) => (
                                    <div key={index} className="bg-blue-50 rounded-lg p-4 group hover:bg-blue-100 transition-all duration-300">
                                        <div className="flex justify-between mb-2">
                                            <h3 className="text-blue-800">{club.name}</h3>
                                            <span className="text-blue-500 text-sm">{club.role}</span>
                                        </div>
                                        <div className="text-gray-500 text-sm">{club.meetings}</div>
                                        <div className="text-xs text-blue-400 mt-1">Joined: {club.joinedDate}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 bg-white rounded-xl p-6 shadow-md border border-blue-100">
                    <h2 className="text-xl font-bold text-blue-800 mb-6 flex items-center">
                        <Medal className="w-6 h-6 mr-2 text-blue-500" />
                        Club Badges
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {studentData.badges.map((badge, index) => (
                            <div
                                key={index}
                                className="relative p-6 bg-blue-50 rounded-xl group hover:bg-blue-100 transition-all duration-300"
                            >
                                <div className="absolute inset-0 rounded-xl group-hover:opacity-50 transition-opacity" />
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 p-3 rounded-full bg-blue-600 text-white">
                                        {badge.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-blue-800 mb-1">{badge.title}</h3>
                                    <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                                    <span className="text-xs text-blue-500">{badge.earnedDate}</span>
                                </div>
                                <div className="absolute top-2 right-2">
                                    <ShieldCheck className="w-5 h-5 text-blue-500" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;