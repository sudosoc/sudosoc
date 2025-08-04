import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { ebookId, rating } = await request.json()

    // Validate input
    if (!ebookId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: 'Invalid e-book ID or rating' },
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

    // Check if user has already rated this ebook
    const existingRating = await auth.getRating(user.id, ebookId, 'ebook')
    
    if (existingRating) {
      return NextResponse.json(
        { message: 'You have already rated this ebook before' },
        { status: 409 }
      )
    }

    // Track the rating
    await auth.addRating(user.id, ebookId, 'ebook', rating)

    return NextResponse.json(
      { 
        message: 'Rating submitted successfully',
        ebookId,
        rating
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Rating error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 