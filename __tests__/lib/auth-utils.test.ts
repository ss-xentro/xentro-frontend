import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	clearAllRoleTokens,
	getRoleFromSession,
	getRoleToken,
	getUnlockedContexts,
	getSessionToken,
	setRoleToken,
	syncAuthCookie,
} from "@/lib/auth-utils";

// Mock localStorage for Node/jsdom
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		}),
		get length() {
			return Object.keys(store).length;
		},
		key: vi.fn(() => null),
	};
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

function clearCookies() {
	document.cookie.split(";").forEach((cookie) => {
		const name = cookie.split("=")[0]?.trim();
		if (name) {
			document.cookie = `${name}=; path=/; max-age=0`;
		}
	});
}

beforeEach(() => {
	localStorageMock.clear();
	clearCookies();
	vi.clearAllMocks();
});

// ── clearAllRoleTokens ──────────────────────────────────

describe("clearAllRoleTokens", () => {
	it("removes all role cookies and legacy localStorage tokens", () => {
		localStorageMock.setItem("founder_token", "tok1");
		localStorageMock.setItem("mentor_token", "tok2");
		localStorageMock.setItem("startup_id", "s1");
		setRoleToken("founder", "cookie-founder");
		setRoleToken("mentor", "cookie-mentor");

		clearAllRoleTokens();

		expect(localStorageMock.removeItem).toHaveBeenCalledWith("founder_token");
		expect(localStorageMock.removeItem).toHaveBeenCalledWith("mentor_token");
		expect(localStorageMock.removeItem).toHaveBeenCalledWith("startup_id");
		expect(getRoleToken("founder")).toBeNull();
		expect(getRoleToken("mentor")).toBeNull();
	});
});

// ── getRoleFromSession ──────────────────────────────────

describe("getRoleFromSession", () => {
	it("returns null when no session exists", () => {
		expect(getRoleFromSession()).toBeNull();
	});

	it("returns role from auth cookie", () => {
		syncAuthCookie({ role: "founder", name: "Jane" });

		expect(getRoleFromSession()).toBe("founder");
	});

	it("returns null when session is expired", () => {
		localStorageMock.setItem(
			"xentro_session",
			JSON.stringify({
				token: "abc",
				expiresAt: Date.now() - 10000,
				user: { accountType: "startup" },
			})
		);
		expect(getRoleFromSession()).toBeNull();
	});

	it("returns role from valid session", () => {
		localStorageMock.setItem(
			"xentro_session",
			JSON.stringify({
				token: "abc",
				expiresAt: Date.now() + 3600000,
				user: { accountType: "mentor" },
			})
		);
		expect(getRoleFromSession()).toBe("mentor");
	});

	it("returns null for corrupted JSON", () => {
		localStorageMock.setItem("xentro_session", "not-json");
		expect(getRoleFromSession()).toBeNull();
	});
});

// ── getUnlockedContexts ─────────────────────────────────

describe("getUnlockedContexts", () => {
	it("returns empty array when no session", () => {
		expect(getUnlockedContexts()).toEqual([]);
	});

	it("returns contexts from auth cookie", () => {
		syncAuthCookie({ role: "founder", unlockedContexts: ["explorer", "startup"] });

		expect(getUnlockedContexts()).toEqual(["explorer", "startup"]);
	});

	it("returns default explorer context for valid session without contexts", () => {
		localStorageMock.setItem(
			"xentro_session",
			JSON.stringify({
				token: "abc",
				expiresAt: Date.now() + 3600000,
				user: {},
			})
		);
		expect(getUnlockedContexts()).toEqual(["explorer"]);
	});

	it("returns user's unlocked contexts", () => {
		localStorageMock.setItem(
			"xentro_session",
			JSON.stringify({
				token: "abc",
				expiresAt: Date.now() + 3600000,
				user: { unlockedContexts: ["explorer", "startup", "mentor"] },
			})
		);
		expect(getUnlockedContexts()).toEqual(["explorer", "startup", "mentor"]);
	});
});

// ── getSessionToken ─────────────────────────────────────

describe("getSessionToken", () => {
	it("returns null when no auth cookie exists", () => {
		expect(getSessionToken()).toBeNull();
	});

	it("returns placeholder when auth cookie has a role", () => {
		syncAuthCookie({ role: "startup", email: "a@b.com" });
		expect(getSessionToken()).toBe("httponly");
		expect(getSessionToken("founder")).toBe("httponly");
	});

	it("returns null when auth cookie has no role", () => {
		syncAuthCookie({ email: "a@b.com" });
		expect(getSessionToken()).toBeNull();
	});
});
