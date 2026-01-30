import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startups } from '@/db/schemas';
import { eq, and, ne, ilike, or, desc, sql, SQL } from 'drizzle-orm';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');
        const stage = searchParams.get('stage');
        const fundingRound = searchParams.get('funding');
        const sort = searchParams.get('sort') || 'newest';

        const conditions: SQL[] = [
            ne(startups.status, 'stealth'), // Never show stealth
            ne(startups.status, 'shut_down'), // Optionally hide shut_down? keeping for now unless requested
        ];

        if (search) {
            const searchLower = `%${search.toLowerCase()}%`;
            const searchCondition = or(
                ilike(startups.name, searchLower),
                ilike(startups.tagline, searchLower),
                ilike(startups.pitch, searchLower)
            );
            if (searchCondition) {
                conditions.push(searchCondition);
            }
        }

        if (stage && stage !== 'all') {
            conditions.push(eq(startups.stage, stage as any));
        }

        if (fundingRound && fundingRound !== 'all') {
            conditions.push(eq(startups.fundingRound, fundingRound as any));
        }

        let orderBy;
        switch (sort) {
            case 'oldest':
                orderBy = startups.createdAt;
                break;
            case 'funds_high':
                orderBy = desc(startups.fundsRaised);
                break;
            case 'newest':
            default:
                orderBy = desc(startups.createdAt);
                break;
        }

        const results = await db
            .select({
                id: startups.id,
                name: startups.name,
                slug: startups.slug,
                tagline: startups.tagline,
                logo: startups.logo,
                pitch: startups.pitch,
                stage: startups.stage,
                fundingRound: startups.fundingRound,
                fundsRaised: startups.fundsRaised,
                fundingCurrency: startups.fundingCurrency,
                createdAt: startups.createdAt,
            })
            .from(startups)
            .where(and(...conditions))
            .orderBy(orderBy)
            .limit(50);

        return NextResponse.json({ data: results });
    } catch (error) {
        console.error('Public startups API error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch startups' },
            { status: 500 }
        );
    }
}
