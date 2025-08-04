import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const allUsers = await auth.getAllUsers()
    const allSubmissions = await auth.getAllSubmissions()
    const pendingSubmissions = await auth.getPendingSubmissions()

    return NextResponse.json({
      message: 'Persistent storage test',
      stats: {
        totalUsers: allUsers.length,
        totalSubmissions: allSubmissions.length,
        pendingSubmissions: pendingSubmissions.length,
      },
      users: allUsers.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin,
        isBanned: u.isBanned,
      })),
      submissions: allSubmissions.map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        status: s.status,
        submittedBy: s.submittedBy,
      })),
    })
  } catch (error) {
    console.error('Persistent test error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    switch (action) {
      case 'addSubmission':
        const submission = await auth.addSubmission(data)
        return NextResponse.json({
          message: 'Test submission added',
          submission: {
            id: submission.id,
            type: submission.type,
            title: submission.title,
            status: submission.status,
          }
        })
      
      case 'approveSubmission':
        const approved = await auth.approveSubmission(data.submissionId, 'test-admin', data.reviewNotes)
        return NextResponse.json({
          message: 'Test submission approved',
          submission: approved
        })
      
      case 'rejectSubmission':
        const rejected = await auth.rejectSubmission(data.submissionId, 'test-admin', data.reviewNotes)
        return NextResponse.json({
          message: 'Test submission rejected',
          submission: rejected
        })
      
      default:
        return NextResponse.json(
          { message: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Persistent test POST error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 