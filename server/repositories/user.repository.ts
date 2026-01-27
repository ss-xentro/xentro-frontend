import { db } from '@/db/client';
import { authAccounts, explorerProfiles, users } from '@/db/schemas';
import { authProviderEnum } from '@/db/schemas';
import { eq, and } from 'drizzle-orm';
import type { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type UserEntity = InferSelectModel<typeof users>;
export type NewUserEntity = InferInsertModel<typeof users>;
export type AuthAccountEntity = InferSelectModel<typeof authAccounts>;
export type NewAuthAccountEntity = InferInsertModel<typeof authAccounts>;

class UserRepository {
  async findByEmail(email: string) {
    const rows = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
    return rows[0] ?? null;
  }

  async findById(id: string) {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async findAuthAccount(provider: typeof authProviderEnum.enumValues[number], providerAccountId: string) {
    const rows = await db
      .select()
      .from(authAccounts)
      .where(and(eq(authAccounts.provider, provider), eq(authAccounts.providerAccountId, providerAccountId)))
      .limit(1);
    return rows[0] ?? null;
  }

  async createExplorer(params: { name: string; email: string; phone?: string | null; interests?: string[] }) {
    const email = params.email.toLowerCase();
    const [user] = await db
      .insert(users)
      .values({ name: params.name, email, phone: params.phone ?? null, accountType: 'explorer' })
      .returning();

    await db
      .insert(explorerProfiles)
      .values({ userId: user.id, interests: params.interests ? JSON.stringify(params.interests) : null })
      .returning();

    return user;
  }

  async createInstitutionUser(params: { name: string; email: string }) {
    const email = params.email.toLowerCase();
    const [user] = await db
      .insert(users)
      .values({ name: params.name, email, accountType: 'institution', phone: null })
      .returning();
    return user;
  }

  async ensureAuthAccount(payload: {
    userId: string;
    provider: typeof authProviderEnum.enumValues[number];
    providerAccountId: string;
    passwordHash?: string | null;
  }) {
    const existing = await this.findAuthAccount(payload.provider, payload.providerAccountId);
    if (existing) {
      if (payload.provider === 'credentials' && payload.passwordHash && existing.passwordHash !== payload.passwordHash) {
        const [updated] = await db
          .update(authAccounts)
          .set({ passwordHash: payload.passwordHash })
          .where(and(eq(authAccounts.id, existing.id)))
          .returning();
        return updated;
      }
      return existing;
    }

    const [created] = await db
      .insert(authAccounts)
      .values({
        userId: payload.userId,
        provider: payload.provider,
        providerAccountId: payload.providerAccountId,
        passwordHash: payload.passwordHash ?? null,
      })
      .returning();

    return created;
  }

  async updateExplorerInterests(userId: string, interests: string[]) {
    await db
      .update(explorerProfiles)
      .set({ interests: interests.length ? JSON.stringify(interests) : null })
      .where(eq(explorerProfiles.userId, userId));
  }
}

export const userRepository = new UserRepository();
