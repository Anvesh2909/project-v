import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const pathname = request.nextUrl.pathname;

    const publicPaths = ['/', '/sign-in', '/admin/sign-in'];

    try {
        if (token) {
            const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
            const role = payload.role;

            if (role === 'ADMIN') {
                if (pathname.startsWith('/admin')) return NextResponse.next(); // ✅ Allow access
                return NextResponse.redirect(new URL('/admin/dashboard', request.url));
            }

            if (role === 'MENTOR') {
                if (pathname.startsWith('/mentor')) return NextResponse.next();
                return NextResponse.redirect(new URL('/mentor/dashboard', request.url));
            }

            if (role === 'INSTRUCTOR') {
                if (pathname.startsWith('/instructor')) return NextResponse.next();
                return NextResponse.redirect(new URL('/instructor/dashboard/manage', request.url));
            }

            if (role === 'STUDENT') {
                if (pathname.startsWith('/dashboard')) return NextResponse.next();
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        } else {
            if (!publicPaths.includes(pathname)) {
                return NextResponse.redirect(new URL('/sign-in', request.url));
            }
        }
    } catch (e) {
        console.error('JWT Verification Error:', e);
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/sign-in', '/admin/:path*', '/mentor/:path*', '/instructor/:path*', '/dashboard/:path*'],
};