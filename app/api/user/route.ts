import { NextRequest, NextResponse } from 'next/server'
import { getUsers } from '@/lib/database'

export async function GET() {
  try {
    console.log('[v0] GET /api/users - Starting request')
    
    const users = await getUsers()
    console.log(`[v0] Successfully retrieved ${users.length} users`)
    
    return NextResponse.json({ 
      success: true, 
      data: users 
    })
  } catch (error) {
    console.error('[v0] Failed to fetch users:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}