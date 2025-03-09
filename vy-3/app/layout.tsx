import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Metadata } from "next";
import AppProviders from "@/app/AppProvider";
import AdminProviders from "@/app/AdminProvider";
import InstructorProviders from "@/app/InstructorProvider";
import MentorProviders from "@/app/MentorProvider";
export const metadata: Metadata = {
    title: 'Lurnex',
    description: 'A NextGen LMS',
    icons: '/logo.png',
};

export default function Layout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
        <body >
        <div className="main">
            <div className="gradient"></div>
        </div>
        <main className="app">
            <AdminProviders>
                <InstructorProviders>
                    <MentorProviders>
                        <AppProviders>
                            {children}
                        </AppProviders>
                    </MentorProviders>
                </InstructorProviders>
            </AdminProviders>
        </main>
        </body>
        </html>
    );
}