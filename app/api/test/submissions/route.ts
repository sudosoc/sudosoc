import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get all submissions
    const allSubmissions = await auth.getAllSubmissions()
    const pendingSubmissions = await auth.getPendingSubmissions()
    
    // Get all users
    const allUsers = await auth.getAllUsers()
    
    return NextResponse.json({
      message: 'Test endpoint for submissions',
      stats: {
        totalSubmissions: allSubmissions.length,
        pendingSubmissions: pendingSubmissions.length,
        totalUsers: allUsers.length,
      },
      submissions: allSubmissions.map(s => ({
        id: s.id,
        type: s.type,
        title: s.title,
        status: s.status,
        submittedBy: s.submittedBy,
        submittedAt: s.submittedAt,
      })),
      users: allUsers.map(u => ({
        id: u.id,
        username: u.username,
        isAdmin: u.isAdmin,
        stats: u.stats,
      })),
    })
  } catch (error) {
    console.error('Test submissions error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, type } = await request.json()
    
    // Create a test submission
    const submission = await auth.addSubmission({
      type: type || 'script',
      title: title || 'Test Submission',
      description: description || 'This is a test submission',
      content: {
        language: 'python',
        type: 'test',
        code: 'print("Hello World")',
        contributor: 'testuser',
      },
      submittedBy: 'test-user-123',
    })
    
    return NextResponse.json({
      message: 'Test submission created successfully',
      submission: {
        id: submission.id,
        type: submission.type,
        title: submission.title,
        status: submission.status,
        submittedBy: submission.submittedBy,
      },
    })
  } catch (error) {
    console.error('Test submission creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 