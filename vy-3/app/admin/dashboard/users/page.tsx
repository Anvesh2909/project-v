"use client"
import React, { useContext, useState, useEffect } from 'react';
import { AdminContext } from '@/context/AdminContext';
import axios from 'axios';
import { Trash2, Search, User, UserPlus } from 'lucide-react';
import Link from 'next/link';
const Page = () => {
    const context = useContext(AdminContext);
    const [users, setUsers] = useState(context?.users || []);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<string | null>(null);

    useEffect(() => {
        if (context?.users) {
            setUsers(context.users);
        }
    }, [context?.users]);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onDelete = async (userId: string) => {
        if (confirm(`Are you sure you want to delete user with ID: ${userId}?`)) {
            setLoading(true);
            setError(null);
            try {
                await axios.delete(`${context?.backendUrl}/admin/deleteUser`, {
                    headers: {
                        token: context?.adminToken
                    },
                    data: { studentId: userId }
                });
                setUsers(users.filter(user => user.id !== userId));
            } catch (e) {
                setError("Failed to delete user");
                console.error("Error deleting user:", e);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <div className="flex gap-3 items-center">
                    <Link href="/admin/dashboard/users/add">
                        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors">
                            <UserPlus className="h-4 w-4" />
                            Add User
                        </button>
                    </Link>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
      {users.length} Users
    </span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 h-4 w-4" />
                </div>
                <input
                    type="text"
                    placeholder="Search by name, email or ID..."
                    className="pl-10 w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading && (
                <div className="p-4 bg-blue-50 text-blue-700 rounded-lg mb-6 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-700 border-t-transparent rounded-full mr-2"></div>
                    Processing request...
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {users.length > 0 ? (
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border">
                    {/* Table Header */}
                    <div className="grid grid-cols-5 gap-4 bg-gray-50 p-4 font-medium text-gray-700 border-b">
                        <div>Profile</div>
                        <div>Name</div>
                        <div>Email</div>
                        <div>Role</div>
                        <div className="text-right pr-4">Actions</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y">
                        {filteredUsers.map((user: any) => (
                            <div
                                key={user.id}
                                className={`grid grid-cols-5 gap-4 p-4 items-center hover:bg-gray-50 transition-colors ${
                                    selectedUser === user.id ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => setSelectedUser(user.id === selectedUser ? null : user.id)}
                            >
                                <div>
                                    {user.image ? (
                                        <img
                                            src={user.image}
                                            alt={user.name}
                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "https://via.placeholder.com/40";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <User className="w-5 h-5 text-gray-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="truncate font-medium">{user.name || "N/A"}</div>
                                <div className="truncate text-gray-600">{user.email || "N/A"}</div>
                                <div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        user.role === "ADMIN"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-green-100 text-green-800"
                                    }`}>
                                        {user.role || "USER"}
                                    </span>
                                </div>
                                <div className="flex justify-end items-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete(user.id);
                                        }}
                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                        disabled={loading}
                                        aria-label="Delete user"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="p-12 text-center bg-gray-50 rounded-lg border">
                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No users found.</p>
                </div>
            )}

            {users.length > 0 && filteredUsers.length === 0 && (
                <div className="p-8 text-center bg-gray-50 rounded-lg border mt-6">
                    <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">No users match your search criteria.</p>
                </div>
            )}
        </div>
    );
};
export default Page;