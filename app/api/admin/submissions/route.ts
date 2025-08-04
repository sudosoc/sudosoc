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

    // Get all submissions (not just pending)
    const allSubmissions = await auth.getAllSubmissions()
    const pendingSubmissions = await auth.getPendingSubmissions()
    
    // Debug logging
    console.log('Admin submissions request:', {
      adminId: user.id,
      adminUsername: user.username,
      totalSubmissions: allSubmissions.length,
      pendingSubmissions: pendingSubmissions.length,
      submissions: allSubmissions.map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        submittedBy: s.submittedBy,
        status: s.status
      }))
    })

    return NextResponse.json({
      submissions: allSubmissions, // Return all submissions for comprehensive view
      pendingSubmissions: pendingSubmissions,
      total: allSubmissions.length,
      pending: pendingSubmissions.length,
    })
  } catch (error) {
    console.error('Admin submissions error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 