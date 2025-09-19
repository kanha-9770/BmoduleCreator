import Redis from 'ioredis';
import { prisma } from './prisma';
import { DatabaseRoles } from './DatabaseRoles';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';

export interface SessionPayload {
  userId: string;
  email: string;
  sessionId: string;
}

export interface AuthContext {
  userId: string;
  userEmail: string;
  roleId?: string;
  roleName?: string;
  permissions: Array<{
    resourceType: 'module' | 'form';
    resourceId: string;
    permissions: {
      canView: boolean;
      canCreate: boolean;
      canEdit: boolean;
      canDelete: boolean;
      canManage: boolean;
    };
    isSystemAdmin: boolean;
    resource?: {
      id: string;
      name: string;
      description?: string;
      moduleId?: string;
    };
  }>;
}

export const verifyToken = (token: string): SessionPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (error) {
    return null;
  }
};

export const createSession = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      status: true,
      email_verified: true,
      createdAt: true,
      first_name: true,
      last_name: true,
      organization: { select: { id: true, name: true } },
      employee: { select: { employeeName: true, department: true } },
      userAssignments: {
        select: {
          role: { select: { id: true, name: true } },
        },
        take: 1,
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const sessionId = crypto.randomUUID();
  const sessionPayload: SessionPayload = {
    userId,
    email: user.email,
    sessionId,
  };
  const token = jwt.sign(sessionPayload, JWT_SECRET, { expiresIn: '7d' });

  // Store session in Redis
  const sessionData = {
    user,
    token,
    expiresAt,
    ipAddress,
    userAgent,
  };
  await redis.set(`session:${token}`, JSON.stringify(sessionData), 'EX', 7 * 24 * 60 * 60); // 7 days

  // Optional: Store in DB for persistence (if needed)
  await prisma.userSession.create({
    data: {
      id: sessionId,
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
    },
  });

  return { ...sessionData, id: sessionId };
};

export const validateSession = async (token: string) => {
  // Check Redis for session
  const cachedSession = await redis.get(`session:${token}`);
  if (cachedSession) {
    console.log('Cache hit for session:', token);
    const sessionData = JSON.parse(cachedSession);
    if (sessionData.expiresAt < new Date().toISOString()) {
      await redis.del(`session:${token}`);
      await prisma.activity.create({
        data: {
          type: 'AUTH_FAILURE',
          description: 'Expired session deleted',
          userId: sessionData.user.id,
          ipAddress: sessionData.ipAddress || '',
          createdAt: new Date(),
        },
      });
      return null;
    }
    return sessionData;
  }

  // Verify JWT token
  const payload = verifyToken(token);
  if (!payload) {
    console.log('Invalid token:', token);
    return null;
  }

  // Fallback to DB (optional)
  const session = await prisma.userSession.findUnique({
    where: { token },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          username: true,
          status: true,
          email_verified: true,
          createdAt: true,
          first_name: true,
          last_name: true,
          organization: { select: { id: true, name: true } },
          employee: { select: { employeeName: true, department: true } },
          userAssignments: {
            select: {
              role: { select: { id: true, name: true } },
            },
            take: 1,
          },
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.userSession.delete({ where: { id: session.id } });
      await redis.del(`session:${token}`);
      await prisma.activity.create({
        data: {
          type: 'AUTH_FAILURE',
          description: 'Expired session deleted',
          userId: session.userId,
          ipAddress: session.ipAddress || '',
          createdAt: new Date(),
        },
      });
    }
    return null;
  }

  // Cache in Redis (selective caching)
  const user = {
    ...session.user,
    roleId: session.user.userAssignments[0]?.role?.id,
    roleName: session.user.userAssignments[0]?.role?.name,
  };
  const shouldCache = user.roleName === 'admin' || (await redis.incr(`access_count:${user.id}`)) > 5;
  if (shouldCache) {
    const ttl = user.roleName === 'admin' ? 3600 : 300;
    await redis.set(`session:${token}`, JSON.stringify({ ...session, user }), 'EX', ttl);
    console.log('Cached session:', token, 'with TTL:', ttl);
  }

  return { ...session, user };
};

export const deleteSession = async (token: string) => {
  await prisma.userSession.deleteMany({ where: { token } });
  await redis.del(`session:${token}`);
  await redis.del(`access_count:${(verifyToken(token)?.userId) || ''}`);
};

export const getCurrentUser = async (req: NextRequest): Promise<AuthContext | null> => {
  const token = req.cookies.get('auth-token')?.value;
  if (!token) {
    return null;
  }

  const session = await validateSession(token);
  if (!session) {
    return null;
  }

  const userPermissions = await DatabaseRoles.getUserPermissionsWithResources(session.user.id);

  return {
    userId: session.user.id,
    userEmail: session.user.email,
    roleId: session.user.roleId,
    roleName: session.user.roleName,
    permissions: userPermissions,
  };
};