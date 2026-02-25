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

const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "";

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "smtp.gmail.com",
	port: Number(process.env.SMTP_PORT) || 587,
	secure: (process.env.SMTP_SECURE || "false").toLowerCase() === "true", // true for 465, false for 587
	auth: {
		user: process.env.SMTP_USER || "",
		pass: process.env.SMTP_PASS || "",
	},
});

export async function POST(request: NextRequest) {
	// Verify shared secret
	const authHeader = request.headers.get("authorization") || "";
	const token = authHeader.replace("Bearer ", "");

	if (!INTERNAL_SECRET || token !== INTERNAL_SECRET) {
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

		const from = process.env.EMAIL_FROM || "Xentro <noreply@xentro.in>";

		await transporter.sendMail({
			from,
			to,
			subject,
			text: text || "",
			html: html || "",
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error("[send-email] Failed:", error);
		return NextResponse.json(
			{ error: "Failed to send email", details: String(error) },
			{ status: 500 }
		);
	}
}
