import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await auth.login(email, password)

    const response = NextResponse.json(
      { message: 'Login successful', user: { id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin } },
      { status: 200 }
    )

    // Set HTTP-only cookie with user ID
    response.cookies.set('auth-token', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }
} 