import Sidebar from "@/components/mentor/Sidebar";

export default function MentorLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="ml-20 md:ml-24 flex-1 pl-6">
                {children}
            </div>
        </div>
    );
}