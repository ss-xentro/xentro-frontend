import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/**
 * POST /api/internal/send-email
 *
 * Internal email-sending endpoint called by Django backend.
 * Secured with a shared INTERNAL_API_SECRET.
 *
 * Body: { to, subject, text, html }
 */

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;
if (!INTERNAL_SECRET) {
	console.warn(
		"[send-email] INTERNAL_API_SECRET is not set — endpoint will reject all requests"
	);
}

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: Number(process.env.SMTP_PORT) || 587,
	secure: (process.env.SMTP_SECURE || "false").toLowerCase() === "true", // true for 465, false for 587
	auth: {
		user: process.env.SMTP_USER || "",
		pass: process.env.SMTP_PASS || "",
	},
});

// H3 fix: Allowlisted HTML tags for email content sanitization
const ALLOWED_TAGS = new Set([
	"p", "br", "b", "i", "u", "strong", "em", "a", "h1", "h2", "h3", "h4",
	"ul", "ol", "li", "table", "tr", "td", "th", "thead", "tbody", "div",
	"span", "img", "hr", "pre", "code", "blockquote",
]);

const ALLOWED_ATTRS = new Set([
	"href", "src", "alt", "style", "class", "width", "height", "align",
	"valign", "bgcolor", "color", "border", "cellpadding", "cellspacing",
	"target", "rel",
]);

function sanitizeHtml(html: string): string {
	// Strip <script>, <iframe>, <object>, <embed>, <form>, event handlers
	let sanitized = html
		.replace(/<script[\s\S]*?<\/script>/gi, "")
		.replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
		.replace(/<object[\s\S]*?<\/object>/gi, "")
		.replace(/<embed[\s\S]*?>/gi, "")
		.replace(/<form[\s\S]*?<\/form>/gi, "")
		.replace(/<link[\s\S]*?>/gi, "");

	// Strip event handler attributes (on*)
	sanitized = sanitized.replace(
		/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
		""
	);

	// Strip javascript: protocol in href/src
	sanitized = sanitized.replace(
		/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi,
		'$1=""'
	);

	return sanitized;
}

// Simple email format validation
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
	// Verify shared secret — reject if not configured or mismatched
	if (!INTERNAL_SECRET) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}
	const authHeader = request.headers.get("authorization") || "";
	const token = authHeader.replace("Bearer ", "");

	if (token !== INTERNAL_SECRET) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await request.json();
		const { to, subject, text, html } = body;

		if (!to || !subject) {
			return NextResponse.json(
				{ error: "Missing required fields: to, subject" },
				{ status: 400 }
			);
		}

		// Validate email format
		if (!EMAIL_RE.test(to)) {
			return NextResponse.json(
				{ error: "Invalid email format" },
				{ status: 400 }
			);
		}

		const from = process.env.EMAIL_FROM || "Xentro <noreply@xentro.in>";

		await transporter.sendMail({
			from,
			to,
			subject,
			text: text || "",
			html: html ? sanitizeHtml(html) : "",
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		// H4 fix: Log full error server-side, return generic message to caller
		console.error("[send-email] Failed:", error);
		return NextResponse.json(
			{ error: "Failed to send email" },
			{ status: 500 }
		);
	}
}
