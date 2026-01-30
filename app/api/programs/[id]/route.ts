import { NextRequest, NextResponse } from 'next/server';
import { verifyInstitutionAuth, requireRole } from '@/server/middleware/institutionAuth';
import { programRepository } from '@/server/repositories/program.repository';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const auth = await verifyInstitutionAuth(request);
    if (!auth.success) return auth.response;

    const program = await programRepository.findById(id);
    if (!program) {
      return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    }

    // Verify access to this program's institution
    if (program.institutionId !== auth.payload.institutionId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ data: program });
  } catch (error) {
    console.error('Get program error:', error);
    return NextResponse.json({ message: 'Failed to fetch program' }, { status: 500 });
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

    // Only owners, admins, and managers can edit programs
    const roleCheck = requireRole(auth.payload, ['owner', 'admin', 'manager']);
    if (roleCheck) return roleCheck.response;

    const program = await programRepository.findById(id);
    if (!program) {
      return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    }

    if (program.institutionId !== auth.payload.institutionId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, description, duration, startDate, endDate, isActive } = body;

    const updated = await programRepository.updateById(id, {
      name: name ?? program.name,
      type: type ?? program.type,
      description: description ?? program.description,
      duration: duration ?? program.duration,
      startDate: startDate ? new Date(startDate) : program.startDate,
      endDate: endDate ? new Date(endDate) : program.endDate,
      isActive: isActive ?? program.isActive,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Update program error:', error);
    return NextResponse.json({ message: 'Failed to update program' }, { status: 500 });
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

    // Only owners and admins can delete programs
    const roleCheck = requireRole(auth.payload, ['owner', 'admin']);
    if (roleCheck) return roleCheck.response;

    const program = await programRepository.findById(id);
    if (!program) {
      return NextResponse.json({ message: 'Program not found' }, { status: 404 });
    }

    if (program.institutionId !== auth.payload.institutionId) {
      return NextResponse.json({ message: 'Access denied' }, { status: 403 });
    }

    await programRepository.deleteById(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete program error:', error);
    return NextResponse.json({ message: 'Failed to delete program' }, { status: 500 });
  }
}
