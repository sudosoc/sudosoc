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

    const unreadCount = await auth.getUnreadNotificationsCount(user.id)

    return NextResponse.json({
      notifications: user.notifications || [],
      unreadCount,
    })
  } catch (error) {
    console.error('Notifications error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }
    const user = await auth.getUserById(authToken)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const { notificationId } = await request.json()
    if (notificationId) {
      await auth.markNotificationAsRead(user.id, notificationId)
    }

    return NextResponse.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 