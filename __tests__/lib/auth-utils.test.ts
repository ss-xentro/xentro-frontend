/**
 * Unit tests for lib/auth-utils.ts — localStorage-based auth helpers.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	clearAllRoleTokens,
	getRoleFromSession,
	getUnlockedContexts,
	getSessionToken,
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
		key: vi.fn((_i: number) => null),
	};
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

beforeEach(() => {
	localStorageMock.clear();
	vi.clearAllMocks();
});

// ── clearAllRoleTokens ──────────────────────────────────

describe("clearAllRoleTokens", () => {
	it("removes all role tokens from localStorage", () => {
		localStorageMock.setItem("founder_token", "tok1");
		localStorageMock.setItem("mentor_token", "tok2");
		localStorageMock.setItem("startup_id", "s1");

		clearAllRoleTokens();

		expect(localStorageMock.removeItem).toHaveBeenCalledWith("founder_token");
		expect(localStorageMock.removeItem).toHaveBeenCalledWith("mentor_token");
		expect(localStorageMock.removeItem).toHaveBeenCalledWith("startup_id");
	});
});

// ── getRoleFromSession ──────────────────────────────────

describe("getRoleFromSession", () => {
	it("returns null when no session exists", () => {
		expect(getRoleFromSession()).toBeNull();
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
	it("returns null when no session exists", () => {
		expect(getSessionToken()).toBeNull();
	});

	it("returns token from valid session", () => {
		localStorageMock.setItem(
			"xentro_session",
			JSON.stringify({
				token: "jwt-token-123",
				expiresAt: Date.now() + 3600000,
			})
		);
		expect(getSessionToken()).toBe("jwt-token-123");
	});

	it("falls back to role-specific token", () => {
		localStorageMock.setItem("mentor_token", "mentor-fallback");
		expect(getSessionToken("mentor")).toBe("mentor-fallback");
	});

	it("returns null for expired session without role fallback", () => {
		localStorageMock.setItem(
			"xentro_session",
			JSON.stringify({
				token: "expired",
				expiresAt: Date.now() - 10000,
			})
		);
		expect(getSessionToken()).toBeNull();
	});
});
