import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startups, startupFounders, startupActivityLogs, users } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { sendEmail } from '@/server/services/email';

// Generate URL-friendly slug from startup name
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 80) + '-' + Date.now().toString(36);
}

// Validation helpers
function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateStartupData(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
        errors.push('Startup name is required (min 2 characters)');
    }

    if (data.pitch && typeof data.pitch === 'string' && data.pitch.length > 160) {
        errors.push('One-line pitch must be 160 characters or less');
    }

    if (!data.primaryContactEmail || !validateEmail(String(data.primaryContactEmail))) {
        errors.push('Valid primary contact email is required');
    }

    const validStages = ['idea', 'mvp', 'early_traction', 'growth', 'scale'];
    if (data.stage && !validStages.includes(String(data.stage))) {
        errors.push('Invalid startup stage');
    }

    const validStatuses = ['active', 'stealth', 'paused', 'acquired', 'shut_down'];
    if (data.status && !validStatuses.includes(String(data.status))) {
        errors.push('Invalid startup status');
    }

    const validRounds = ['bootstrapped', 'pre_seed', 'seed', 'series_a', 'series_b_plus', 'unicorn'];
    if (data.fundingRound && !validRounds.includes(String(data.fundingRound))) {
        errors.push('Invalid funding round');
    }

    return { valid: errors.length === 0, errors };
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validation = validateStartupData(body);
        if (!validation.valid) {
            return NextResponse.json(
                { message: validation.errors.join(', '), errors: validation.errors },
                { status: 400 }
            );
        }

        const {
            name,
            tagline,
            logo,
            pitch,
            foundedDate,
            stage,
            status = 'active',
            fundingRound = 'bootstrapped',
            fundsRaised,
            fundingCurrency = 'USD',
            investors,
            primaryContactEmail,
            location,
            founders = [],
        } = body;

        // Generate unique slug
        const slug = generateSlug(name);

        // Check if primary contact exists as user, create if not
        const email = primaryContactEmail.toLowerCase();
        const [existingOwner] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        let owner = existingOwner;

        if (!owner) {
            // Create user for the primary founder
            const founderName = founders[0]?.name || name;
            const [newUser] = await db
                .insert(users)
                .values({
                    name: founderName,
                    email,
                    accountType: 'startup',
                })
                .returning();
            owner = newUser;
        }

        // Create startup
        const [startup] = await db
            .insert(startups)
            .values({
                name: name.trim(),
                slug,
                tagline: tagline?.trim() || null,
                logo: logo || null,
                pitch: pitch?.trim() || null,
                foundedDate: foundedDate ? new Date(foundedDate) : null,
                stage: stage || null,
                status,
                fundingRound,
                fundsRaised: fundsRaised ? String(fundsRaised) : null,
                fundingCurrency,
                investors: Array.isArray(investors) ? investors : null,
                primaryContactEmail: email,
                location: location?.trim() || null,
                ownerId: owner.id,
            })
            .returning();

        // Add founders
        const validRoles = ['ceo', 'cto', 'coo', 'cfo', 'cpo', 'founder', 'co_founder'];
        for (let i = 0; i < founders.length; i++) {
            const founder = founders[i];
            if (!founder?.name || !founder?.email) continue;

            const founderEmail = String(founder.email).toLowerCase();
            const founderRole = validRoles.includes(founder.role) ? founder.role : 'founder';

            // Get or create user for founder
            const [existingFounderUser] = await db
                .select()
                .from(users)
                .where(eq(users.email, founderEmail))
                .limit(1);
            let founderUser = existingFounderUser;

            if (!founderUser) {
                const [newUser] = await db
                    .insert(users)
                    .values({
                        name: founder.name,
                        email: founderEmail,
                        accountType: 'startup',
                    })
                    .returning();
                founderUser = newUser;
            }

            // Add to startup_founders
            await db
                .insert(startupFounders)
                .values({
                    startupId: startup.id,
                    userId: founderUser.id,
                    name: founder.name,
                    email: founderEmail,
                    role: founderRole,
                    isPrimary: i === 0, // First founder is primary
                })
                .onConflictDoNothing();
        }

        // Log activity
        await db.insert(startupActivityLogs).values({
            startupId: startup.id,
            userId: owner.id,
            action: 'created',
            details: {
                name: startup.name,
                stage: startup.stage,
                status: startup.status,
                fundingRound: startup.fundingRound,
                foundersCount: founders.length,
            },
        });

        // Send confirmation email
        try {
            await sendStartupCreatedEmail({
                email,
                startupName: startup.name,
                dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard`,
            });
        } catch (emailError) {
            console.error('Failed to send startup creation email:', emailError);
            // Don't fail the request if email fails
        }

        return NextResponse.json(
            {
                data: startup,
                message: 'Startup created successfully',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Create startup error:', error);
        return NextResponse.json(
            { message: 'Failed to create startup' },
            { status: 500 }
        );
    }
}

// Helper to send startup created email
async function sendStartupCreatedEmail(params: {
    email: string;
    startupName: string;
    dashboardUrl: string;
}) {
    const { email, startupName, dashboardUrl } = params;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 0;">
        <div style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid #e5e7eb;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #1a1a1a;">XENTRO</h1>
        </div>
        <div style="padding: 40px;">
          <h2 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #1a1a1a;">
            Your startup has been created 🎉
          </h2>
          <p style="margin: 0 0 24px; font-size: 16px; color: #4b5563; line-height: 1.6;">
            Congratulations! <strong>${startupName}</strong> is now live on XENTRO. 
            You can manage your startup profile, invite team members, and track your progress from your dashboard.
          </p>
          <a href="${dashboardUrl}" 
             style="display: inline-block; padding: 14px 32px; background-color: #0A0A0A; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 500; font-size: 14px;">
            View Dashboard
          </a>
          <p style="margin: 32px 0 0; font-size: 14px; color: #6b7280;">
            If you have any questions, reply to this email or contact our support team.
          </p>
        </div>
        <div style="padding: 24px 40px; background-color: #fafafa; text-align: center;">
          <p style="margin: 0; font-size: 12px; color: #9ca3af;">
            © ${new Date().getFullYear()} XENTRO. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

    const text = `
Your startup has been created 🎉

Congratulations! ${startupName} is now live on XENTRO.
You can manage your startup profile, invite team members, and track your progress from your dashboard.

View Dashboard: ${dashboardUrl}

If you have any questions, reply to this email or contact our support team.

© ${new Date().getFullYear()} XENTRO. All rights reserved.
  `;

    await sendEmail({
        to: email,
        subject: 'Your startup has been created 🎉',
        html,
        text,
    });
}

export async function GET() {
    try {
        // Get all public (non-stealth) startups for listing
        const allStartups = await db
            .select()
            .from(startups)
            .orderBy(startups.createdAt);

        // Filter out stealth startups for public API
        const publicStartups = allStartups.filter((s) => s.status !== 'stealth');

        return NextResponse.json({ data: publicStartups });
    } catch (error) {
        console.error('Fetch startups error:', error);
        return NextResponse.json(
            { message: 'Failed to fetch startups' },
            { status: 500 }
        );
    }
}
