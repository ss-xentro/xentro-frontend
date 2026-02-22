import { db } from '@/db/client';
import { investorProfiles, users } from '@/db/schemas';
import { and, eq } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type InvestorProfileEntity = InferSelectModel<typeof investorProfiles>;
export type NewInvestorProfileEntity = InferInsertModel<typeof investorProfiles>;

class InvestorRepository {
    async findProfileByUserId(userId: string) {
        const rows = await db.select().from(investorProfiles).where(eq(investorProfiles.userId, userId)).limit(1);
        return rows[0] ?? null;
    }

    async upsertProfile(payload: Partial<NewInvestorProfileEntity> & { userId: string }) {
        const existing = await this.findProfileByUserId(payload.userId);
        if (existing) {
            const [updated] = await db
                .update(investorProfiles)
                .set({
                    type: payload.type ?? existing.type,
                    firmName: payload.firmName ?? existing.firmName,
                    bio: payload.bio ?? existing.bio,
                    investmentStages: payload.investmentStages ?? existing.investmentStages,
                    checkSizeMin: payload.checkSizeMin ?? existing.checkSizeMin,
                    checkSizeMax: payload.checkSizeMax ?? existing.checkSizeMax,
                    sectors: payload.sectors ?? existing.sectors,
                    portfolioCompanies: payload.portfolioCompanies ?? existing.portfolioCompanies,
                    notableInvestments: payload.notableInvestments ?? existing.notableInvestments,
                    dealFlowPreferences: payload.dealFlowPreferences ?? existing.dealFlowPreferences,
                    linkedinUrl: payload.linkedinUrl ?? existing.linkedinUrl,
                    status: payload.status ?? existing.status,
                    approvedAt: payload.approvedAt ?? existing.approvedAt,
                    rejectedReason: payload.rejectedReason ?? existing.rejectedReason,
                    identityVerified: payload.identityVerified ?? existing.identityVerified,
                    fundsDeclared: payload.fundsDeclared ?? existing.fundsDeclared,
                    experienceVerified: payload.experienceVerified ?? existing.experienceVerified,
                })
                .where(eq(investorProfiles.userId, payload.userId))
                .returning();
            return updated;
        }

        const [created] = await db
            .insert(investorProfiles)
            .values({
                userId: payload.userId,
                type: payload.type ?? 'angel',
                firmName: payload.firmName ?? null,
                bio: payload.bio ?? null,
                investmentStages: payload.investmentStages ?? null,
                checkSizeMin: payload.checkSizeMin ?? null,
                checkSizeMax: payload.checkSizeMax ?? null,
                sectors: payload.sectors ?? null,
                portfolioCompanies: payload.portfolioCompanies ?? null,
                notableInvestments: payload.notableInvestments ?? null,
                dealFlowPreferences: payload.dealFlowPreferences ?? null,
                linkedinUrl: payload.linkedinUrl ?? null,
                status: payload.status ?? 'pending',
                identityVerified: false,
                fundsDeclared: false,
                experienceVerified: false,
            })
            .returning();
        return created;
    }

    async listPending(limit = 50) {
        return db
            .select({
                profileId: investorProfiles.id,
                userId: investorProfiles.userId,
                status: investorProfiles.status,
                type: investorProfiles.type,
                firmName: investorProfiles.firmName,
                investmentStages: investorProfiles.investmentStages,
                sectors: investorProfiles.sectors,
                checkSizeMin: investorProfiles.checkSizeMin,
                checkSizeMax: investorProfiles.checkSizeMax,
                linkedinUrl: investorProfiles.linkedinUrl,
                createdAt: investorProfiles.createdAt,
                name: users.name,
                email: users.email,
            })
            .from(investorProfiles)
            .leftJoin(users, eq(users.id, investorProfiles.userId))
            .where(and(eq(investorProfiles.status, 'pending')))
            .limit(limit);
    }
}

export const investorRepository = new InvestorRepository();
