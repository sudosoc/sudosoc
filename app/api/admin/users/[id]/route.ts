import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { username, email, isAdmin, isBanned } = await request.json()

    // Get the current user from the session to check if they're admin
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      )
    }

    const currentUser = await auth.getUserById(authToken)
    if (!currentUser || !currentUser.isAdmin) {
      return NextResponse.json(
        { message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Update the user
    const updatedUser = await auth.updateUser(id, {
      username,
      email,
      isAdmin,
      isBanned
    })

    if (!updatedUser) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { 
        message: 'User updated successfully', 
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          isAdmin: updatedUser.isAdmin,
          isBanned: updatedUser.isBanned,
          createdAt: updatedUser.createdAt,
          stats: updatedUser.stats
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    )
  }
} 