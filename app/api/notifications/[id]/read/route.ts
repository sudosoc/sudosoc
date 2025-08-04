import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(
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
    
    // Mark notification as read
    await auth.markNotificationAsRead(user.id, notificationId)

    return NextResponse.json(
      { message: 'Notification marked as read' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { message: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
} 