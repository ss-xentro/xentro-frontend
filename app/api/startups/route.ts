import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { startups, users, teamMembers, institutions, institutionApplications } from '@/db/schemas';
import { eq, and } from 'drizzle-orm';
import { verifyToken } from '@/server/services/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                   request.cookies.get('institution_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const rawInstitutionId = typeof decoded.institutionId === 'string' ? decoded.institutionId : '';
    if (!rawInstitutionId) {
      return NextResponse.json(
        { message: 'Institution not found in token' },
        { status: 401 }
      );
    }

    // Backward-compat: some tokens store application ID; resolve to published institution if needed
    let institutionId = rawInstitutionId;
    const institutionRecord = await db.query.institutions.findFirst({ where: eq(institutions.id, rawInstitutionId) });
    if (!institutionRecord) {
      const appRecord = await db.query.institutionApplications.findFirst({ where: eq(institutionApplications.id, rawInstitutionId) });
      if (appRecord?.institutionId) {
        institutionId = appRecord.institutionId;
      }
    }
    if (!institutionId) {
      return NextResponse.json(
        { message: 'Institution not resolved from token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, stage, location, oneLiner, founderName, founderEmail, additionalFounders } = body;

    if (!location || !location.trim()) {
      return NextResponse.json(
        { message: 'Location is required' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { message: 'Startup name is required' },
        { status: 400 }
      );
    }

    if (!founderEmail) {
      return NextResponse.json(
        { message: 'Founder email is required' },
        { status: 400 }
      );
    }

    // Check if user exists with this email, create if not
    let founder = await db.query.users.findFirst({
      where: eq(users.email, founderEmail.toLowerCase()),
    });

    if (!founder) {
      // Create a new user for the founder
      const [newUser] = await db
        .insert(users)
        .values({
          name: founderName || name,
          email: founderEmail.toLowerCase(),
          accountType: 'explorer',
        })
        .returning();
      founder = newUser;
    }

    // Create the startup tied to the institution
    console.log('[Add Startup] Creating startup with:', { institutionId, name, stage, location });
    const [startup] = await db
      .insert(startups)
      .values({
        institutionId,
        name,
        stage: stage || null,
        location: location || null,
        oneLiner: oneLiner || null,
        ownerId: founder.id,
      })
      .returning();
    console.log('[Add Startup] Created startup:', { id: startup.id, institutionId: startup.institutionId });

    // Attach founder as team member
    await db.insert(teamMembers).values({
      userId: founder.id,
      startupId: startup.id,
      role: 'founder',
    }).onConflictDoNothing({
      target: [teamMembers.userId, teamMembers.startupId],
    });

    // Additional founders
    if (Array.isArray(additionalFounders)) {
      for (const extra of additionalFounders) {
        if (!extra?.email || !extra?.name) continue;
        const email = String(extra.email).toLowerCase();
        const name = String(extra.name);

        let user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (!user) {
          const [newUser] = await db.insert(users).values({
            name,
            email,
            accountType: 'explorer',
          }).returning();
          user = newUser;
        }

        await db.insert(teamMembers).values({
          userId: user.id,
          startupId: startup.id,
          role: 'founder',
        }).onConflictDoNothing({ target: [teamMembers.userId, teamMembers.startupId] });
      }
    }

    return NextResponse.json({ data: startup }, { status: 201 });
  } catch (error) {
    console.error('Create startup error:', error);
    return NextResponse.json(
      { message: 'Failed to create startup' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication token
    const token = request.headers.get('authorization')?.replace('Bearer ', '') || 
                   request.cookies.get('institution_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const institutionId = typeof decoded.institutionId === 'string' ? decoded.institutionId : '';
    if (!institutionId) {
      return NextResponse.json(
        { message: 'Institution not found in token' },
        { status: 401 }
      );
    }

    // Return startups belonging to this institution
    const startupsList = await db.query.startups.findMany({
      where: eq(startups.institutionId, institutionId),
      orderBy: (startups, { desc }) => [desc(startups.id)],
    });

    return NextResponse.json({ data: startupsList });
  } catch (error) {
    console.error('Fetch startups error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch startups' },
      { status: 500 }
    );
  }
}
