import { NextRequest, NextResponse } from 'next/server';
import { submitInvestorApplication } from '@/server/services/investor';
import { investorRepository } from '@/server/repositories/investor.repository';
import { requireAuth } from '@/server/services/auth';

export async function GET(request: NextRequest) {
    try {
        await requireAuth(request.headers, ['admin', 'approver']);
        const pending = await investorRepository.listPending();
        return NextResponse.json({ data: pending });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unauthorized';
        const status = message === 'Forbidden' ? 403 : message === 'Unauthorized' ? 401 : 400;
        return NextResponse.json({ message }, { status });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name, email, password, firmName,
            investmentStages, checkSizeMin, checkSizeMax,
            sectors, portfolioCompanies, notableInvestments,
            dealFlowPreferences, linkedinUrl,
        } = body ?? {};

        if (!name || !email) {
            return NextResponse.json({ message: 'Name and email are required' }, { status: 400 });
        }

        const result = await submitInvestorApplication({
            name,
            email,
            password,
            firmName,
            investmentStages: Array.isArray(investmentStages) ? investmentStages : undefined,
            checkSizeMin: checkSizeMin != null ? Number(checkSizeMin) : null,
            checkSizeMax: checkSizeMax != null ? Number(checkSizeMax) : null,
            sectors: Array.isArray(sectors) ? sectors : undefined,
            portfolioCompanies: Array.isArray(portfolioCompanies) ? portfolioCompanies : undefined,
            notableInvestments: Array.isArray(notableInvestments) ? notableInvestments : undefined,
            dealFlowPreferences,
            linkedinUrl,
        });

        return NextResponse.json({ data: result }, { status: 201 });
    } catch (error) {
        console.error('Failed to submit investor application', error);
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return NextResponse.json({ message }, { status: 400 });
    }
}
