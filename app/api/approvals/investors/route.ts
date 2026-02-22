import { NextResponse } from 'next/server';
import { approveInvestor, rejectInvestor } from '@/server/services/investor';
import { requireAuth } from '@/server/services/auth';

export async function POST(request: Request) {
    try {
        await requireAuth(request.headers, ['admin', 'approver']);
        const body = await request.json();
        const { investorUserId, decision, reason } = body ?? {};
        if (!investorUserId || !decision) {
            return NextResponse.json({ message: 'investorUserId and decision are required' }, { status: 400 });
        }

        if (decision === 'approve') {
            const profile = await approveInvestor({ investorUserId });
            return NextResponse.json({ data: profile }, { status: 200 });
        }

        if (decision === 'reject') {
            const profile = await rejectInvestor({ investorUserId, reason });
            return NextResponse.json({ data: profile }, { status: 200 });
        }

        return NextResponse.json({ message: 'Invalid decision' }, { status: 400 });
    } catch (error) {
        console.error('Failed to process investor approval', error);
        return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
    }
}
