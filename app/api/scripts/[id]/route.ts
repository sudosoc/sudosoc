import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scriptId = params.id

    if (!scriptId) {
      return NextResponse.json(
        { message: 'Script ID is required' },
        { status: 400 }
      )
    }

    // Get all approved scripts from JSON storage
    const allSubmissions = await auth.getAllSubmissions()
    const script = allSubmissions.find(
      s => s.id === scriptId && s.type === 'script' && s.status === 'approved'
    )

    if (!script) {
      return NextResponse.json(
        { message: 'Script not found' },
        { status: 404 }
      )
    }

    // Map to the format expected by the frontend
    const scriptDetails = {
      id: script.id,
      title: script.title,
      description: script.description,
      language: script.content.language,
      type: script.content.type,
      sourceCode: script.content.sourceCode || script.content.code || '',
      contributor: script.content.contributor,
      averageRating: script.content.averageRating || 0,
      totalRatings: script.content.totalRatings || 0,
      createdAt: script.submittedAt,
      updatedAt: script.reviewedAt || script.submittedAt,
    }

    return NextResponse.json(scriptDetails)
  } catch (error) {
    console.error('Error fetching script details:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
} 