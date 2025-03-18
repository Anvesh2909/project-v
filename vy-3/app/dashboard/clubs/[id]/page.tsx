// "use client";
//
// import React, { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//     ChevronLeft,
//     Users,
//     Calendar,
//     Clock,
//     MessageSquare,
//     FileText,
//     Share2,
//     UserPlus,
//     ExternalLink,
//     MapPin,
//     Star
// } from "lucide-react";
//
// interface ClubEvent {
//     id: string;
//     title: string;
//     date: string;
//     time: string;
//     location: string;
// }
//
// interface ClubDiscussion {
//     id: string;
//     title: string;
//     author: string;
//     comments: number;
//     lastActive: string;
// }
//
// interface ClubResource {
//     id: string;
//     title: string;
//     type: string;
//     link: string;
// }
//
// interface ClubMember {
//     id: string;
//     name: string;
//     role: string;
//     image: string;
//     joinDate: string;
// }
//
// interface Club {
//     id: string;
//     name: string;
//     description: string;
//     image: string;
//     category: string;
//     memberCount: number;
//     meetingLocation: string;
//     meetingSchedule: string;
//     nextMeeting: string;
//     leader: string;
//     leaderTitle: string;
//     leaderImage: string;
//     leaderContact: string;
//     established: string;
//     upcomingEvents: ClubEvent[];
//     discussions: ClubDiscussion[];
//     resources: ClubResource[];
//     members: ClubMember[];
// }
//
// type ClubsDetailData = {
//     [key: string]: Club;
// };
//
// const clubsDetailData: ClubsDetailData = {
//     "1": {
//         id: "1",
//         name: "Data Science Club",
//         description: "A community of data enthusiasts exploring machine learning, statistics, and data visualization together. Our club welcomes members of all skill levels, from beginners to experienced data scientists. We organize workshops, hackathons, and invite industry experts to share their knowledge.",
//         image: "/images/clubs/data-science.jpg",
//         category: "Technology",
//         memberCount: 128,
//         meetingLocation: "Science Building, Room 305",
//         meetingSchedule: "Every Thursday at 6:00 PM",
//         nextMeeting: "Thursday, 6:00 PM",
//         leader: "Alex Johnson",
//         leaderTitle: "Club President",
//         leaderImage: "/images/avatars/alex.jpg",
//         leaderContact: "alex.johnson@example.com",
//         established: "September 2020",
//         upcomingEvents: [
//             { id: "e1", title: "Introduction to Machine Learning Workshop", date: "June 15, 2023", time: "6:00 PM - 8:00 PM", location: "Tech Center, Room 101" },
//             { id: "e2", title: "Data Visualization Hackathon", date: "June 22, 2023", time: "3:00 PM - 9:00 PM", location: "Innovation Lab" },
//             { id: "e3", title: "Guest Speaker: AI in Healthcare", date: "June 29, 2023", time: "7:00 PM - 8:30 PM", location: "Online (Zoom)" }
//         ],
//         discussions: [
//             { id: "d1", title: "Recommended resources for beginners", author: "Maria S.", comments: 24, lastActive: "2 hours ago" },
//             { id: "d2", title: "Project collaboration ideas for summer", author: "David L.", comments: 18, lastActive: "Yesterday" },
//             { id: "d3", title: "Feedback on last week's workshop", author: "Priya K.", comments: 9, lastActive: "3 days ago" }
//         ],
//         resources: [
//             { id: "r1", title: "Python for Data Analysis", type: "Book", link: "#" },
//             { id: "r2", title: "Intro to R Programming", type: "Tutorial", link: "#" },
//             { id: "r3", title: "Club Project Repository", type: "GitHub", link: "#" }
//         ],
//         members: [
//             { id: "m1", name: "Sarah Kim", role: "Vice President", image: "/images/avatars/sarah.jpg", joinDate: "October 2020" },
//             { id: "m2", name: "David Chen", role: "Treasurer", image: "/images/avatars/david.jpg", joinDate: "January 2021" },
//             { id: "m3", name: "Maria Garcia", role: "Event Coordinator", image: "/images/avatars/maria.jpg", joinDate: "March 2021" },
//             { id: "m4", name: "James Wilson", role: "Member", image: "/images/avatars/james.jpg", joinDate: "September 2021" },
//             { id: "m5", name: "Aisha Patel", role: "Member", image: "/images/avatars/aisha.jpg", joinDate: "February 2022" }
//         ]
//     }
// };
//
// const ClubDetailPage = ({ params }: { params: { id: string } }) => {
//     const [isLoading, setIsLoading] = useState(true);
//     const club = clubsDetailData[params.id];
//
//     // Simulate loading state
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             setIsLoading(false);
//         }, 800);
//         return () => clearTimeout(timer);
//     }, []);
//
//     // Loading state
//     if (isLoading) {
//         return (
//             <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gradient-to-br from-blue-50/40 to-indigo-50/40 min-h-screen flex items-center justify-center">
//                 <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/30 w-full max-w-md">
//                     <div className="flex flex-col items-center">
//                         <div className="flex space-x-2 mb-4">
//                             <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                             <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                             <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                         </div>
//                         <p className="text-blue-800 font-medium">Loading club details...</p>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
//
//     // Club not found state
//     if (!club) {
//         return (
//             <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gradient-to-br from-blue-50/40 to-indigo-50/40 min-h-screen flex items-center justify-center">
//                 <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/30 w-full max-w-md text-center">
//                     <div className="p-3 bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
//                         <Users className="h-8 w-8 text-red-500" />
//                     </div>
//                     <h2 className="text-xl font-bold mb-2 text-gray-800">Club Not Found</h2>
//                     <p className="text-gray-600 mb-6">The club you're looking for doesn't exist or may have been removed.</p>
//                     <Link href="/dashboard/clubs" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-300 inline-block font-medium">
//                         Browse Clubs
//                     </Link>
//                 </div>
//             </div>
//         );
//     }
//
//     return (
//         <div className="p-6 bg-gray-50">
//             <div className="max-w-7xl mx-auto">
//                 <Link href="/dashboard/clubs" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
//                     <ChevronLeft className="h-4 w-4 mr-1" /> Back to Clubs
//                 </Link>
//
//                 {/* Club Header */}
//                 <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 mb-6">
//                     <div className="flex flex-col md:flex-row gap-6">
//                         <div className="w-full md:w-1/3">
//                             <div className="relative rounded-lg overflow-hidden h-60 md:h-full">
//                                 <Image
//                                     src={club.image || "/images/club-placeholder.jpg"}
//                                     alt={club.name}
//                                     fill
//                                     className="object-cover"
//                                 />
//                                 <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-lg">
//                                     {club.category}
//                                 </div>
//                             </div>
//                         </div>
//
//                         <div className="w-full md:w-2/3">
//                             <div className="flex justify-between items-start flex-wrap gap-4">
//                                 <div>
//                                     <h1 className="text-3xl font-bold text-blue-800 mb-2">{club.name}</h1>
//                                     <p className="text-gray-600 flex items-center mb-4">
//                                         <Users className="h-4 w-4 mr-1" /> {club.memberCount} members
//                                     </p>
//                                 </div>
//                                 <div className="flex gap-2">
//                                     <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
//                                         <UserPlus className="h-4 w-4 mr-2" /> Join Club
//                                     </button>
//                                     <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg flex items-center hover:bg-blue-100">
//                                         <Share2 className="h-4 w-4 mr-2" /> Share
//                                     </button>
//                                 </div>
//                             </div>
//
//                             <p className="text-gray-700 mb-6">{club.description}</p>
//
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-4">
//                                 <div className="flex items-center text-sm text-gray-600">
//                                     <Clock className="h-4 w-4 mr-2 text-blue-500" />
//                                     <span>Founded: {club.established}</span>
//                                 </div>
//                                 <div className="flex items-center text-sm text-gray-600">
//                                     <MapPin className="h-4 w-4 mr-2 text-blue-500" />
//                                     <span>{club.meetingLocation}</span>
//                                 </div>
//                                 <div className="flex items-center text-sm text-gray-600">
//                                     <Calendar className="h-4 w-4 mr-2 text-blue-500" />
//                                     <span>{club.meetingSchedule}</span>
//                                 </div>
//                                 <div className="flex items-center text-sm text-gray-600">
//                                     <Users className="h-4 w-4 mr-2 text-blue-500" />
//                                     <span>Led by {club.leader}, {club.leaderTitle}</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* Main Content Grid */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                     {/* Left Column - Events & Discussions */}
//                     <div className="lg:col-span-2">
//                         {/* Upcoming Events */}
//                         <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 mb-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className="flex items-center">
//                                     <Calendar className="w-5 h-5 mr-2 text-blue-500" />
//                                     <h2 className="text-xl font-bold text-blue-800">Upcoming Events</h2>
//                                 </div>
//                                 <Link
//                                     href={`/dashboard/clubs/${club.id}/events`}
//                                     className="text-sm text-blue-600 hover:text-blue-800"
//                                 >
//                                     View All
//                                 </Link>
//                             </div>
//                             {club.upcomingEvents.length > 0 ? (
//                                 <div className="space-y-4">
//                                     {club.upcomingEvents.map((event: ClubEvent) => (
//                                         <div key={event.id} className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50 transition-colors">
//                                             <h3 className="text-lg font-semibold text-blue-700">{event.title}</h3>
//                                             <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
//                                                 <p className="text-sm text-gray-600 flex items-center">
//                                                     <Calendar className="h-4 w-4 mr-1" /> {event.date}
//                                                 </p>
//                                                 <p className="text-sm text-gray-600 flex items-center">
//                                                     <Clock className="h-4 w-4 mr-1" /> {event.time}
//                                                 </p>
//                                                 <p className="text-sm text-gray-600 flex items-center">
//                                                     <MapPin className="h-4 w-4 mr-1" /> {event.location}
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <p className="text-gray-500">No upcoming events scheduled</p>
//                             )}
//                         </div>
//
//                         {/* Discussions */}
//                         <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 mb-6">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className="flex items-center">
//                                     <MessageSquare className="w-5 h-5 mr-2 text-blue-500" />
//                                     <h2 className="text-xl font-bold text-blue-800">Discussions</h2>
//                                 </div>
//                                 <div className="flex items-center gap-4">
//                                     <button className="text-sm text-blue-600 hover:text-blue-800">New Topic</button>
//                                     <Link
//                                         href={`/dashboard/clubs/${club.id}/discussions`}
//                                         className="text-sm text-blue-600 hover:text-blue-800"
//                                     >
//                                         View All
//                                     </Link>
//                                 </div>
//                             </div>
//
//                             {club.discussions.length > 0 ? (
//                                 <div className="space-y-3">
//                                     {club.discussions.map((discussion: ClubDiscussion) => (
//                                         <div key={discussion.id} className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50 transition-colors">
//                                             <h3 className="text-md font-semibold text-blue-700">{discussion.title}</h3>
//                                             <div className="flex justify-between mt-2">
//                                                 <p className="text-sm text-gray-600">
//                                                     Started by {discussion.author}
//                                                 </p>
//                                                 <p className="text-sm text-gray-600 flex items-center">
//                                                     <MessageSquare className="h-3 w-3 mr-1" /> {discussion.comments}
//                                                 </p>
//                                             </div>
//                                             <p className="text-xs text-gray-500 mt-1">Active {discussion.lastActive}</p>
//                                         </div>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <p className="text-gray-500">No discussions started yet</p>
//                             )}
//                         </div>
//
//                         {/* Resources */}
//                         <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
//                             <div className="flex items-center mb-4">
//                                 <FileText className="w-5 h-5 mr-2 text-blue-500" />
//                                 <h2 className="text-xl font-bold text-blue-800">Club Resources</h2>
//                             </div>
//
//                             {club.resources.length > 0 ? (
//                                 <div className="space-y-3">
//                                     {club.resources.map((resource: ClubResource) => (
//                                         <a
//                                             key={resource.id}
//                                             href={resource.link}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="border border-blue-100 rounded-lg p-4 hover:bg-blue-50 transition-colors flex justify-between items-center"
//                                         >
//                                             <div>
//                                                 <h3 className="text-md font-semibold text-blue-700">{resource.title}</h3>
//                                                 <p className="text-sm text-gray-600">{resource.type}</p>
//                                             </div>
//                                             <ExternalLink className="h-4 w-4 text-blue-500" />
//                                         </a>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <p className="text-gray-500">No resources available</p>
//                             )}
//                         </div>
//                     </div>
//
//                     {/* Right Column - Members */}
//                     <div className="lg:col-span-1">
//                         {/* Club Leader */}
//                         <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100 mb-6">
//                             <h2 className="text-xl font-bold text-blue-800 mb-4">Club Leader</h2>
//                             <div className="flex items-center">
//                                 <div className="relative w-16 h-16 mr-4">
//                                     <Image
//                                         src={club.leaderImage || "/images/avatar-placeholder.jpg"}
//                                         alt={club.leader}
//                                         fill
//                                         className="rounded-full object-cover"
//                                     />
//                                 </div>
//                                 <div>
//                                     <h3 className="font-semibold text-blue-700">{club.leader}</h3>
//                                     <p className="text-gray-600 text-sm">{club.leaderTitle}</p>
//                                     <p className="text-blue-600 text-sm mt-1">{club.leaderContact}</p>
//                                 </div>
//                             </div>
//                         </div>
//
//                         {/* Members */}
//                         <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
//                             <div className="flex items-center justify-between mb-4">
//                                 <h2 className="text-xl font-bold text-blue-800">Members</h2>
//                                 <span className="text-sm text-gray-500">{club.memberCount} total</span>
//                             </div>
//
//                             <div className="space-y-4">
//                                 {club.members.map((member: ClubMember) => (
//                                     <div key={member.id} className="flex items-center">
//                                         <div className="relative w-10 h-10 mr-3">
//                                             <Image
//                                                 src={member.image || "/images/avatar-placeholder.jpg"}
//                                                 alt={member.name}
//                                                 fill
//                                                 className="rounded-full object-cover"
//                                             />
//                                         </div>
//                                         <div>
//                                             <p className="font-medium text-gray-800">{member.name}</p>
//                                             <div className="flex justify-between">
//                                                 <p className="text-xs text-gray-500">{member.role}</p>
//                                                 <p className="text-xs text-gray-500 ml-4">Joined {member.joinDate}</p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//
//                                 {club.memberCount > club.members.length && (
//                                     <Link
//                                         href={`/dashboard/clubs/${club.id}/members`}
//                                         className="text-blue-600 hover:text-blue-800 text-sm flex items-center mt-2"
//                                     >
//                                         View all {club.memberCount} members
//                                     </Link>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default ClubDetailPage;
import React from 'react'

const Page = () => {
    return (
        <div>Page</div>
    )
}
export default Page