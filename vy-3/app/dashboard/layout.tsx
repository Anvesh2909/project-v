import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="ml-10 md:ml-5 flex-1">
                {children}
            </div>
        </div>
    );
}