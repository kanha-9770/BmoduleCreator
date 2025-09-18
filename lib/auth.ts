import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key'

export interface SessionPayload {
  userId: string
  email: string
  sessionId: string
}

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12)
}

export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const generateToken = (payload: SessionPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string): SessionPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload
  } catch (error) {
    return null
  }
}

export const createSession = async (
  userId: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  const session = await prisma.userSession.create({
    data: {
      userId,
      token: generateToken({ userId, email: '', sessionId: '' }),
      expiresAt,
      ipAddress,
      userAgent,
    },
  })

  // Update token with session ID
  const sessionPayload: SessionPayload = {
    userId,
    email: '',
    sessionId: session.id,
  }
  
  const updatedToken = generateToken(sessionPayload)
  
  await prisma.userSession.update({
    where: { id: session.id },
    data: { token: updatedToken },
  })

  return { ...session, token: updatedToken }
}

export const validateSession = async (token: string) => {
  const payload = verifyToken(token)
  if (!payload) return null

  const session = await prisma.userSession.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.userSession.delete({ where: { id: session.id } })
    }
    return null
  }

  return session
}

export const deleteSession = async (token: string) => {
  await prisma.userSession.deleteMany({
    where: { token },
  })
}

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}