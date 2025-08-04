import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, ratingIndex } = await request.json()
    
    if (!userId || ratingIndex === undefined) {
      return NextResponse.json(
        { message: 'User ID and rating index are required' },
        { status: 400 }
      )
    }

    // Get all users
    const users = await auth.getAllUsers()
    const user = users.find(u => u.id === userId)
    
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    // Remove the rating from user's contributions
    const updatedRatings = [...user.contributions.ratings]
    updatedRatings.splice(ratingIndex, 1)
    
    // Update user's ratings
    user.contributions.ratings = updatedRatings
    user.stats.likesGiven = Math.max(0, user.stats.likesGiven - 1)
    
    // Update the user in storage by directly updating the users array
    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users[userIndex] = user
      storage.setUsers(users)
    }

    return NextResponse.json(
      { message: 'Rating deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting rating:', error)
    return NextResponse.json(
      { message: 'Failed to delete rating' },
      { status: 500 }
    )
  }
} 