import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { users } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { verifyToken } from '@/server/services/auth';

// Temporary table for institution team members
// In production, you'd create a proper institution_team_members table

interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  phone?: string;
  bio?: string;
}

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

    const institutionId = decoded.institutionId;
    if (!institutionId) {
      return NextResponse.json(
        { message: 'Institution not found in token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, role, department, phone, bio } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { message: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Check if user exists with this email
    let teamMember = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!teamMember) {
      // Create a new user for the team member
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email: email.toLowerCase(),
          accountType: 'admin', // or 'institution-staff'
        })
        .returning();
      teamMember = newUser;
    }

    // In production, create a relation in institution_team_members table
    // For now, return the user data with additional fields
    const teamMemberData: TeamMemberData = {
      id: teamMember.id,
      name: teamMember.name,
      email: teamMember.email,
      role,
      department,
      phone,
      bio,
    };

    return NextResponse.json({ data: teamMemberData }, { status: 201 });
  } catch (error) {
    console.error('Add team member error:', error);
    return NextResponse.json(
      { message: 'Failed to add team member' },
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

    const institutionId = decoded.institutionId;
    if (!institutionId) {
      return NextResponse.json(
        { message: 'Institution not found in token' },
        { status: 401 }
      );
    }

    // For now, return users with 'admin' account type
    // In production, query institution_team_members table
    const teamMembers = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.accountType, 'admin'),
    });

    return NextResponse.json({ data: teamMembers });
  } catch (error) {
    console.error('Fetch team members error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
