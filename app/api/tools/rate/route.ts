import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { toolId, rating } = await request.json()
    
    if (!toolId || rating === undefined || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Tool ID and valid rating (1-5) are required' },
        { status: 400 }
      )
    }

    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await auth.getUserById(authToken)
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Check if user has already rated this tool
    const existingRating = await auth.getRating(user.id, toolId, 'tool')
    
    if (existingRating) {
      return NextResponse.json(
        { message: 'You have already rated this tool before' },
        { status: 409 }
      )
    }

    // Add rating to user's activity
    await auth.addRating(user.id, toolId, 'tool', rating)

    return NextResponse.json({
      message: 'Rating submitted successfully',
      rating: { toolId, rating, userId: user.id }
    })
  } catch (error) {
    console.error('Tool rating error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 