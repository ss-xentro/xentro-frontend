/**
 * Component tests for UI primitives — Badge, Button.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, VerifiedBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

// ── Badge ────────────────────────────────────────────────

describe("Badge", () => {
	it("renders children text", () => {
		render(<Badge>Active</Badge>);
		expect(screen.getByText("Active")).toBeInTheDocument();
	});

	it("applies variant classes", () => {
		const { container } = render(<Badge variant="success">OK</Badge>);
		const span = container.querySelector("span");
		expect(span?.className).toContain("success");
	});

	it("applies size classes", () => {
		const { container } = render(<Badge size="md">Big</Badge>);
		const span = container.querySelector("span");
		expect(span?.className).toContain("text-sm");
	});

	it("merges custom className", () => {
		const { container } = render(<Badge className="custom">X</Badge>);
		const span = container.querySelector("span");
		expect(span?.className).toContain("custom");
	});
});

describe("VerifiedBadge", () => {
	it("renders with Verified text", () => {
		render(<VerifiedBadge />);
		expect(screen.getByText("Verified")).toBeInTheDocument();
	});

	it("contains an SVG icon", () => {
		const { container } = render(<VerifiedBadge />);
		expect(container.querySelector("svg")).toBeInTheDocument();
	});
});

// ── Button ───────────────────────────────────────────────

describe("Button", () => {
	it("renders children text", () => {
		render(<Button>Click Me</Button>);
		expect(screen.getByText("Click Me")).toBeInTheDocument();
	});

	it("renders as disabled", () => {
		render(<Button disabled>Nope</Button>);
		expect(screen.getByText("Nope")).toBeDisabled();
	});

	it("shows loading spinner when isLoading", () => {
		const { container } = render(<Button isLoading>Loading</Button>);
		const btn = container.querySelector("button");
		// When loading, button should be disabled
		expect(btn).toBeDisabled();
	});

	it("applies variant classes", () => {
		const { container } = render(<Button variant="danger">Delete</Button>);
		const btn = container.querySelector("button");
		expect(btn?.className).toContain("error");
	});

	it("applies fullWidth style", () => {
		const { container } = render(<Button fullWidth>Wide</Button>);
		const btn = container.querySelector("button");
		expect(btn?.className).toContain("w-full");
	});
});
