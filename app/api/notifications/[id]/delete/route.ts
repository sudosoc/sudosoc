import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!authToken) {
      return NextResponse.json(
        { message: 'Authentication required' },
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

    const notificationId = params.id
    
    // Delete notification
    await auth.deleteNotification(user.id, notificationId)

    return NextResponse.json(
      { message: 'Notification deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting notification:', error)
    return NextResponse.json(
      { message: 'Failed to delete notification' },
      { status: 500 }
    )
  }
} 