import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { title, description, language, type, code } = await request.json()
    if (!title || !description || !language || !type || !code) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 })
    }
    const authToken = request.cookies.get('auth-token')?.value
    if (!authToken) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 })
    }
    const user = await auth.getUserById(authToken)
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const scriptId = Date.now().toString() // For user's stats, not the submission ID

    const submission = await auth.addSubmission({
      type: 'script',
      title,
      description,
      content: { language, type, code, contributor: user.username },
      submittedBy: user.id,
    })

    await auth.addScript(user.id, scriptId) // Track for user's stats

    console.log('Script submission created:', {
      submissionId: submission.id,
      scriptId: scriptId,
      title: submission.title,
      submittedBy: submission.submittedBy,
      userUsername: user.username,
      status: submission.status
    })

    return NextResponse.json(
      {
        message: 'Script submitted successfully and sent for review',
        script: {
          id: scriptId, title, description, language, type, code,
          contributor: user.username, isApproved: false, createdAt: new Date(),
        },
        submissionId: submission.id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Script submission error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
} 