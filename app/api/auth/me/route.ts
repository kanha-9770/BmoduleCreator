import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/authMiddleware';

export const GET = withAuth(async (req: NextRequest) => {
  const user = (req as any).user;
  const authContext = (req as any).authContext;

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      email_verified: user.email_verified,
      status: user.status,
      createdAt: user.createdAt,
      first_name: user.first_name,
      last_name: user.last_name,
      organization: user.organization,
      employee: user.employee,
      roleId: authContext.roleId,
      roleName: authContext.roleName,
      permissions: authContext.permissions,
    },
  });
});