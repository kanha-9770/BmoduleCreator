import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = await validateSession(token)

    if (!session) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get modules through role permissions
    const roleBasedModules = await prisma.$queryRaw`
      SELECT DISTINCT 
        fm.id AS module_id,
        fm.name AS module_name,
        fm.description,
        fm.icon,
        fm.color,
        fm.path,
        fm.parent_id,
        fm.level,
        fm.sort_order,
        fm.module_type
      FROM users u
      JOIN user_unit_assignments uua ON uua.user_id = u.id
      JOIN roles r ON r.id = uua.role_id
      JOIN role_permissions rp ON rp.role_id = r.id AND rp.granted = TRUE
      JOIN form_modules fm ON fm.id = rp.module_id AND fm.is_active = TRUE
      WHERE u.id = ${userId}
    `

    // Get modules through direct user permissions
    const userBasedModules = await prisma.$queryRaw`
      SELECT DISTINCT 
        fm.id AS module_id,
        fm.name AS module_name,
        fm.description,
        fm.icon,
        fm.color,
        fm.path,
        fm.parent_id,
        fm.level,
        fm.sort_order,
        fm.module_type
      FROM users u
      JOIN user_permissions up ON up.user_id = u.id AND up.granted = TRUE
      JOIN form_modules fm ON fm.id = up.module_id AND fm.is_active = TRUE
      WHERE u.id = ${userId}
    `

    // Combine and deduplicate results
    const allModules = [...roleBasedModules as any[], ...userBasedModules as any[]]
    const uniqueModules = allModules.reduce((acc, current) => {
      const existing = acc.find((item: { module_id: any }) => item.module_id === current.module_id)
      if (!existing) {
        acc.push(current)
      }
      return acc
    }, [] as any[])


    const childModuleIds = uniqueModules.map((m: { module_id: any }) => m.module_id)
    const parentModules = await prisma.$queryRaw`
      WITH RECURSIVE parent_hierarchy AS (
        -- Base case: get direct parents of permitted modules
        SELECT DISTINCT 
          fm.id AS module_id,
          fm.name AS module_name,
          fm.description,
          fm.icon,
          fm.color,
          fm.path,
          fm.parent_id,
          fm.level,
          fm.sort_order,
          fm.module_type
        FROM form_modules fm
        WHERE fm.id IN (
          SELECT DISTINCT parent_id 
          FROM form_modules 
          WHERE id = ANY(${childModuleIds}::text[]) 
          AND parent_id IS NOT NULL
        )
        AND fm.is_active = TRUE
        
        UNION
        
        -- Recursive case: get parents of parents
        SELECT DISTINCT
          fm.id AS module_id,
          fm.name AS module_name,
          fm.description,
          fm.icon,
          fm.color,
          fm.path,
          fm.parent_id,
          fm.level,
          fm.sort_order,
          fm.module_type
        FROM form_modules fm
        INNER JOIN parent_hierarchy ph ON fm.id = ph.parent_id
        WHERE fm.is_active = TRUE
      )
      SELECT * FROM parent_hierarchy
    `

    // Combine permitted modules with their parent modules
    const allVisibleModules = [...uniqueModules, ...parentModules as any[]]
    const finalModules = allVisibleModules.reduce((acc, current) => {
      const existing = acc.find((item: { module_id: any }) => item.module_id === current.module_id)
      if (!existing) {
        acc.push(current)
      }
      return acc
    }, [] as any[])

    // Sort by level and sort_order
    finalModules.sort((a: { level: number; sort_order: number }, b: { level: number; sort_order: number }) => {
      if (a.level !== b.level) {
        return a.level - b.level
      }
      return a.sort_order - b.sort_order
    })

    return NextResponse.json({
      success: true,
      modules: finalModules
    })

  } catch (error) {
    console.error('Get permitted modules error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}