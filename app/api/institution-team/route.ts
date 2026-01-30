import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/client';
import { users, institutionMembers } from '@/db/schemas';
import { eq } from 'drizzle-orm';
import { verifyInstitutionAuth, requireRole } from '@/server/middleware/institutionAuth';
import { institutionMemberRepository } from '@/server/repositories/institutionMember.repository';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyInstitutionAuth(request);
    if (!auth.success) return auth.response;

    // Only owners and admins can add team members
    const roleCheck = requireRole(auth.payload, ['owner', 'admin']);
    if (roleCheck) return roleCheck.response;

    const body = await request.json();
    const { name, email, role, department, phone, bio } = body;

    if (!name || !email || !role) {
      return NextResponse.json(
        { message: 'Name, email, and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'viewer'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be admin, manager, or viewer' },
        { status: 400 }
      );
    }

    // Check if user exists with this email
    let user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
      // Create a new user for the team member
      const [newUser] = await db
        .insert(users)
        .values({
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          accountType: 'institution',
        })
        .returning();
      user = newUser;
    }

    // Check if already a member
    const existingMember = await institutionMemberRepository.findByUserAndInstitution(
      user.id,
      auth.payload.institutionId
    );

    if (existingMember) {
      if (existingMember.isActive) {
        return NextResponse.json(
          { message: 'This user is already a team member' },
          { status: 400 }
        );
      }
      // Reactivate the member
      await institutionMemberRepository.updateById(existingMember.id, {
        role: role as 'admin' | 'manager' | 'viewer',
        isActive: true,
        invitedByUserId: auth.payload.userId || null,
        invitedAt: new Date(),
      });
      return NextResponse.json({
        data: { ...existingMember, role, isActive: true },
        message: 'Team member reactivated',
      });
    }

    // Create institution member record
    const member = await institutionMemberRepository.create({
      institutionId: auth.payload.institutionId,
      userId: user.id,
      role: role as 'admin' | 'manager' | 'viewer',
      invitedByUserId: auth.payload.userId || null,
      invitedAt: new Date(),
      isActive: true,
    });

    return NextResponse.json({
      data: {
        id: member.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        role: member.role,
        invitedAt: member.invitedAt,
      },
    }, { status: 201 });
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
    const auth = await verifyInstitutionAuth(request);
    if (!auth.success) return auth.response;

    const members = await institutionMemberRepository.findByInstitution(
      auth.payload.institutionId
    );

    return NextResponse.json({ data: members });
  } catch (error) {
    console.error('Fetch team members error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}
