import { NextRequest, NextResponse } from 'next/server';
import { verifyInstitutionAuth, requireRole } from '@/server/middleware/institutionAuth';
import { institutionMemberRepository } from '@/server/repositories/institutionMember.repository';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const auth = await verifyInstitutionAuth(request);
    if (!auth.success) return auth.response;

    const member = await institutionMemberRepository.findById(id);
    if (!member) {
      return NextResponse.json({ message: 'Team member not found' }, { status: 404 });
    }

    // Verify access to this institution
    if (member.institutionId !== auth.payload.institutionId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ data: member });
  } catch (error) {
    console.error('Get team member error:', error);
    return NextResponse.json({ message: 'Failed to fetch team member' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const auth = await verifyInstitutionAuth(request);
    if (!auth.success) return auth.response;

    // Only owners and admins can update team members
    const roleCheck = requireRole(auth.payload, ['owner', 'admin']);
    if (roleCheck) return roleCheck.response;

    const member = await institutionMemberRepository.findById(id);
    if (!member) {
      return NextResponse.json({ message: 'Team member not found' }, { status: 404 });
    }

    if (member.institutionId !== auth.payload.institutionId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { role } = body;

    // Validate role
    const validRoles = ['admin', 'manager', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Invalid role. Must be admin, manager, or viewer' },
        { status: 400 }
      );
    }

    const updated = await institutionMemberRepository.updateById(id, {
      role: role as 'admin' | 'manager' | 'viewer',
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update team member error:', error);
    return NextResponse.json({ message: 'Failed to update team member' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const auth = await verifyInstitutionAuth(request);
    if (!auth.success) return auth.response;

    // Only owners and admins can remove team members
    const roleCheck = requireRole(auth.payload, ['owner', 'admin']);
    if (roleCheck) return roleCheck.response;

    const member = await institutionMemberRepository.findById(id);
    if (!member) {
      return NextResponse.json({ message: 'Team member not found' }, { status: 404 });
    }

    if (member.institutionId !== auth.payload.institutionId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    // Don't allow removing the last owner
    if (member.role === 'owner') {
      return NextResponse.json(
        { message: 'Cannot remove the institution owner' },
        { status: 400 }
      );
    }

    // Soft delete (deactivate) instead of hard delete
    await institutionMemberRepository.deactivate(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete team member error:', error);
    return NextResponse.json({ message: 'Failed to remove team member' }, { status: 500 });
  }
}
