/**
 * In-memory session cache for institution authentication
 * In production, use Redis or similar distributed cache
 */

interface CachedSession {
  institutionId: string;
  applicationId?: string;
  email: string;
  role: 'owner' | 'admin' | 'manager' | 'viewer';
  userId?: string;
  validUntil: number;
}

class SessionCache {
  private cache = new Map<string, CachedSession>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(token: string, session: Omit<CachedSession, 'validUntil'>) {
    this.cache.set(token, {
      ...session,
      validUntil: Date.now() + this.TTL,
    });
  }

  get(token: string): Omit<CachedSession, 'validUntil'> | null {
    const session = this.cache.get(token);
    if (!session) return null;

    // Check if expired
    if (Date.now() > session.validUntil) {
      this.cache.delete(token);
      return null;
    }

    return session;
  }

  delete(token: string) {
    this.cache.delete(token);
  }

  clear() {
    this.cache.clear();
  }

  // Clean up expired sessions periodically
  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [token, session] of this.cache.entries()) {
        if (now > session.validUntil) {
          this.cache.delete(token);
        }
      }
    }, 60 * 1000); // Run every minute
  }
}

export const sessionCache = new SessionCache();

// Start automatic cleanup
if (typeof window === 'undefined') {
  sessionCache.startCleanup();
}
