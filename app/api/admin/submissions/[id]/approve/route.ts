import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const submissionId = params.id
    const { reviewNotes } = await request.json()

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

    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Get the submission
    const submission = await auth.getSubmissionById(submissionId)

    if (!submission) {
      return NextResponse.json(
        { message: 'Submission not found' },
        { status: 404 }
      )
    }

    // Approve the submission
    const approvedSubmission = await auth.approveSubmission(submissionId, user.id, reviewNotes)

    if (!approvedSubmission) {
      return NextResponse.json(
        { message: 'Failed to approve submission' },
        { status: 500 }
      )
    }

    // Add notification to the submitter
    await auth.addNotification(submission.submittedBy, {
      type: 'approval',
      message: `Your ${submission.type} "${submission.title}" has been approved!`,
      itemId: submission.id,
      itemType: submission.type,
    })

    return NextResponse.json({
      message: 'Submission approved successfully',
      submission: approvedSubmission,
    })
  } catch (error) {
    console.error('Approve submission error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 