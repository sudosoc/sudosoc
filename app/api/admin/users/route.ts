import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get the auth token from cookies
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get user by ID
    const user = await auth.getUserById(authToken)

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all users
    const allUsers = await auth.getAllUsers()
    const allSubmissions = await auth.getAllSubmissions()

    return NextResponse.json({
      users: allUsers.map((u: any) => {
        const userSubmissions = allSubmissions.filter(s => s.submittedBy === u.id).length
        const totalContributions = userSubmissions + u.stats.likesGiven + u.stats.sharesMade + u.stats.reportsSubmitted
        
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          isAdmin: u.isAdmin,
          createdAt: u.createdAt,
          stats: {
            ...u.stats,
            contributions: totalContributions,
          },
          isBanned: u.isBanned || false,
          contributions: u.contributions,
        }
      }),
      total: allUsers.length,
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 