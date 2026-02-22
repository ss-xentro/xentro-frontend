import { NextResponse } from 'next/server';
import { signJwt } from '@/server/services/auth';

// Admin credentials — in production these should come from env vars or DB
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@xentro.io';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body ?? {};

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
        }

        if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
            return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
        }

        const token = await signJwt({
            sub: 'admin-1',
            email: ADMIN_EMAIL,
            role: 'admin',
            name: 'Alex Chen',
        });

        return NextResponse.json({
            token,
            user: {
                id: 'admin-1',
                email: ADMIN_EMAIL,
                name: 'Alex Chen',
                role: 'admin',
            },
        });
    } catch (error) {
        console.error('Admin login error:', error);
        return NextResponse.json({ message: 'Login failed' }, { status: 500 });
    }
}
