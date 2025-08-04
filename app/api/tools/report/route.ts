import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { toolId, reason, description } = await request.json()

    // Validate input
    if (!toolId) {
      return NextResponse.json(
        { message: 'Tool ID is required' },
        { status: 400 }
      )
    }

    if (!reason || !description) {
      return NextResponse.json(
        { message: 'Reason and description are required' },
        { status: 400 }
      )
    }

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

    // Track the report with additional data
    await auth.addReport(user.id, toolId, 'tool', reason, description)

    return NextResponse.json(
      { 
        message: 'Report submitted successfully',
        toolId
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Report error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 