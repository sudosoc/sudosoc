import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get all approved scripts from JSON storage
    const allSubmissions = await auth.getAllSubmissions();
    const approvedScripts = allSubmissions.filter(
      s => s.type === 'script' && s.status === 'approved'
    );

    // Map to the format expected by the frontend
    const scriptsWithRatings = approvedScripts.map(script => ({
      id: script.id,
      title: script.title,
      description: script.description,
      language: script.content.language,
      type: script.content.type,
      contributor: script.content.contributor,
      averageRating: script.content.averageRating || 0,
      totalRatings: script.content.totalRatings || 0,
      createdAt: script.submittedAt,
      updatedAt: script.reviewedAt || script.submittedAt,
    }));

    return NextResponse.json(scriptsWithRatings);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 