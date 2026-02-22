import { investorRepository } from '@/server/repositories/investor.repository';
import { userRepository } from '@/server/repositories/user.repository';
import { signJwt, hashPassword } from './auth';
import { sendInvestorApprovalEmail, sendInvestorRejectionEmail } from './email';

export async function submitInvestorApplication(payload: {
    name: string;
    email: string;
    password?: string;
    firmName?: string;
    investmentStages?: string[];
    checkSizeMin?: number | null;
    checkSizeMax?: number | null;
    sectors?: string[];
    portfolioCompanies?: string[];
    notableInvestments?: string[];
    dealFlowPreferences?: string;
    linkedinUrl?: string;
}) {
    const email = payload.email.toLowerCase();
    const existingUser = await userRepository.findByEmail(email);

    const user = existingUser ?? (await userRepository.createInvestorUser({ name: payload.name, email }));

    // Create credentials auth account if password provided
    if (payload.password) {
        const passwordHash = await hashPassword(payload.password);
        await userRepository.ensureAuthAccount({
            userId: user.id,
            provider: 'credentials',
            providerAccountId: email,
            passwordHash,
        });
    }

    const profile = await investorRepository.upsertProfile({
        userId: user.id,
        firmName: payload.firmName ?? null,
        investmentStages: payload.investmentStages ?? null,
        checkSizeMin: payload.checkSizeMin != null ? String(payload.checkSizeMin) : null,
        checkSizeMax: payload.checkSizeMax != null ? String(payload.checkSizeMax) : null,
        sectors: payload.sectors ?? null,
        portfolioCompanies: payload.portfolioCompanies ?? null,
        notableInvestments: payload.notableInvestments ?? null,
        dealFlowPreferences: payload.dealFlowPreferences ?? null,
        linkedinUrl: payload.linkedinUrl ?? null,
        status: 'pending',
    });

    const token = await signJwt({ sub: user.id, email: user.email, role: user.accountType, investorStatus: profile.status });
    return { user, profile, token };
}

export async function approveInvestor(params: { investorUserId: string }) {
    const profile = await investorRepository.upsertProfile({
        userId: params.investorUserId,
        status: 'approved',
        approvedAt: new Date(),
        rejectedReason: null,
    });

    const user = await userRepository.findById(params.investorUserId);
    if (user?.email) {
        await sendInvestorApprovalEmail({ email: user.email, name: user.name, loginUrl: '/investor-login' });
    }

    return profile;
}

export async function rejectInvestor(params: { investorUserId: string; reason?: string | null }) {
    const profile = await investorRepository.upsertProfile({
        userId: params.investorUserId,
        status: 'rejected',
        rejectedReason: params.reason ?? 'Not approved',
    });

    const user = await userRepository.findById(params.investorUserId);
    if (user?.email) {
        await sendInvestorRejectionEmail({ email: user.email, name: user.name, reason: params.reason || 'Not approved' });
    }

    return profile;
}

export async function getInvestorProfile(userId: string) {
    return investorRepository.findProfileByUserId(userId);
}
