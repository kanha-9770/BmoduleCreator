import type { DefaultSession, DefaultUser } from "next-auth"
import type { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: string
      department: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    department: string
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role: string
    department: string
  }
}
