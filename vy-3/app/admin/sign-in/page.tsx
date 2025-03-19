"use client"
import {useContext, useState} from "react";
import Image from "next/image";
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LottieAnimation from "@/components/LottieAnimation";
import animation from "@/public/Animation3.json";
import {AdminContext} from "@/context/AdminContext";
import axios from "axios";

export default function AdminSignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const context = useContext(AdminContext);
    const backendUrl = context?.backendUrl;
    const setAdminToken = context?.setAdminToken;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        try {
            const response = await axios.post(backendUrl + "/auth/admin/login", { id: email, password });
            if (response.data.token) {
                if (setAdminToken) {
                    setAdminToken(response.data.token);
                }
                router.push("/admin/dashboard");
            } else {
                setError("Authentication failed. Please verify your admin credentials.");
            }
        } catch (e) {
            setError("Authentication failed. Please verify your admin credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="border-b border-blue-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 text-blue-800 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Home</span>
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-8">
                    {/* Animation Container */}
                    <div className="w-full max-w-md lg:w-1/2 hidden lg:block">
                        <div className="p-4">
                            <LottieAnimation
                                animationData={animation}
                                className="w-full h-auto max-h-[400px]"
                            />
                        </div>
                    </div>

                    {/* Form Container */}
                    <div className="w-full max-w-md lg:w-1/2">
                        <div className="bg-white border border-blue-100 p-8 rounded-2xl shadow-lg">
                            <div className="flex flex-col items-center mb-8 space-y-4">
                                <div className="flex items-center justify-center">
                                    <Image
                                        src="/logo.png"
                                        alt="Lurnex Logo"
                                        width={80}
                                        height={80}
                                        className="hover:scale-105 transition-transform"
                                    />
                                    <ShieldCheck className="text-blue-600 ml-2 h-6 w-6" />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-3xl font-bold text-blue-800 mb-2">
                                        Admin Access
                                        <span className="ml-2 text-blue-500">.</span>
                                    </h2>
                                    <p className="text-gray-600">Sign in to access the administrator dashboard</p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-600">
                                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                    <span className="text-sm">{error}</span>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Admin Email
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                placeholder="admin@example"
                                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                placeholder="••••••••"
                                                className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-50 border border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5" />
                                                ) : (
                                                    <Eye className="h-5 w-5" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Authenticating...</span>
                                        </>
                                    ) : (
                                        <span>Access Admin Panel</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="w-full max-w-md lg:hidden mt-8">
                        <LottieAnimation
                            animationData={animation}
                            className="w-full h-auto max-h-[200px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}