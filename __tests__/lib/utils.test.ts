/**
 * Unit tests for lib/utils.ts utility functions.
 */
import { describe, it, expect } from "vitest";
import {
	cn,
	formatCurrency,
	formatNumber,
	getInitials,
	slugify,
	truncate,
	hasValidPitchContent,
	hasValidPitchItem,
} from "@/lib/utils";

// ── cn (className joiner) ────────────────────────────────

describe("cn", () => {
	it("joins multiple class names", () => {
		expect(cn("a", "b", "c")).toBe("a b c");
	});

	it("filters out falsy values", () => {
		expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
	});

	it("returns empty string for no classes", () => {
		expect(cn()).toBe("");
	});
});

// ── formatCurrency ───────────────────────────────────────

describe("formatCurrency", () => {
	it("formats small USD amounts", () => {
		const result = formatCurrency(5000);
		expect(result).toContain("5,000");
		expect(result).toContain("$");
	});

	it("uses compact notation for millions", () => {
		const result = formatCurrency(2500000);
		expect(result).toContain("$");
		// compact notation renders as $2.5M or similar
		expect(result.length).toBeLessThan(10);
	});

	it("supports other currencies", () => {
		const result = formatCurrency(1000, "EUR");
		expect(result).toContain("€");
	});
});

// ── formatNumber ─────────────────────────────────────────

describe("formatNumber", () => {
	it("returns plain number for < 1000", () => {
		expect(formatNumber(42)).toBe("42");
	});

	it("formats thousands with K suffix", () => {
		expect(formatNumber(1500)).toBe("1.5K");
	});

	it("formats millions with M suffix", () => {
		expect(formatNumber(2500000)).toBe("2.5M");
	});
});

// ── getInitials ──────────────────────────────────────────

describe("getInitials", () => {
	it("returns two-letter initials from full name", () => {
		expect(getInitials("John Doe")).toBe("JD");
	});

	it("truncates to 2 chars for long names", () => {
		expect(getInitials("Deva Priya Kumar")).toBe("DP");
	});

	it("handles single name", () => {
		expect(getInitials("Deva")).toBe("D");
	});
});

// ── slugify ──────────────────────────────────────────────

describe("slugify", () => {
	it("converts spaces to hyphens", () => {
		expect(slugify("Hello World")).toBe("hello-world");
	});

	it("removes special characters", () => {
		expect(slugify("Hello! @World#")).toBe("hello-world");
	});

	it("trims leading/trailing hyphens", () => {
		expect(slugify("  -Hello- ")).toBe("hello");
	});
});

// ── truncate ─────────────────────────────────────────────

describe("truncate", () => {
	it("does not alter short text", () => {
		expect(truncate("Hi", 10)).toBe("Hi");
	});

	it("truncates long text with ellipsis", () => {
		expect(truncate("This is a long sentence", 10)).toBe("This is a...");
	});
});

// ── hasValidPitchContent ─────────────────────────────────

describe("hasValidPitchContent", () => {
	it("returns false for null/undefined/empty", () => {
		expect(hasValidPitchContent(null)).toBe(false);
		expect(hasValidPitchContent(undefined)).toBe(false);
		expect(hasValidPitchContent("")).toBe(false);
	});

	it("returns false for empty HTML paragraphs", () => {
		expect(hasValidPitchContent("<p></p>")).toBe(false);
		expect(hasValidPitchContent("<p><br></p>")).toBe(false);
	});

	it("returns true for actual content", () => {
		expect(hasValidPitchContent("Real content")).toBe(true);
		expect(hasValidPitchContent("<p>Hello</p>")).toBe(true);
	});

	it("returns true for media tags", () => {
		expect(hasValidPitchContent('<img src="test.jpg">')).toBe(true);
	});
});

// ── hasValidPitchItem ────────────────────────────────────

describe("hasValidPitchItem", () => {
	it("returns false for null/undefined", () => {
		expect(hasValidPitchItem(null)).toBe(false);
		expect(hasValidPitchItem(undefined)).toBe(false);
	});

	it("returns false for empty title", () => {
		expect(hasValidPitchItem({ title: "" })).toBe(false);
	});

	it("returns true for valid item", () => {
		expect(hasValidPitchItem({ title: "Product", description: "Great" })).toBe(true);
	});
});
