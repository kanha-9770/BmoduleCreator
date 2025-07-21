import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear authentication cookies
    cookies().delete('auth_token'); // Replace with your actual cookie name
    cookies().delete('refresh_token'); // If using refresh tokens

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Failed to logout'
      },
      { status: 500 }
    );
  }
}