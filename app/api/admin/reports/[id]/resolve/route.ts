import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { storage } from '@/lib/storage'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, reportIndex } = await request.json()
    
    if (!userId || reportIndex === undefined) {
      return NextResponse.json(
        { message: 'User ID and report index are required' },
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

    // Remove the report from user's contributions
    const updatedReports = [...user.contributions.reports]
    updatedReports.splice(reportIndex, 1)
    
    // Update user's reports
    user.contributions.reports = updatedReports
    user.stats.reportsSubmitted = Math.max(0, user.stats.reportsSubmitted - 1)
    
    // Update the user in storage by directly updating the users array
    const userIndex = users.findIndex(u => u.id === userId)
    if (userIndex !== -1) {
      users[userIndex] = user
      storage.setUsers(users)
    }

    return NextResponse.json(
      { message: 'Report resolved successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error resolving report:', error)
    return NextResponse.json(
      { message: 'Failed to resolve report' },
      { status: 500 }
    )
  }
} 