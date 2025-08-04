import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }
    const user = await auth.getUserById(authToken)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }
    const userSubmissions = await auth.getSubmissionsByUser(user.id) // Get user's submissions

    return NextResponse.json({
      user: {
        id: user.id, username: user.username, email: user.email, isAdmin: user.isAdmin,
        createdAt: user.createdAt, stats: user.stats, contributions: user.contributions,
        submissions: userSubmissions, // Include submissions here
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 