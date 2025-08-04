import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Get all approved ebooks from JSON storage
    const allSubmissions = await auth.getAllSubmissions();
    const approvedEbooks = allSubmissions.filter(
      s => s.type === 'ebook' && s.status === 'approved'
    );

    // Map to the format expected by the frontend
    const ebooksWithDetails = approvedEbooks.map(ebook => ({
      id: ebook.id,
      title: ebook.title,
      author: ebook.content.author,
      field: ebook.content.field,
      pageCount: ebook.content.pageCount || 0,
      language: ebook.content.language || 'english',
      coverUrl: ebook.content.coverUrl || null,
      pdfUrl: ebook.content.fileUrl, // Use the uploaded file URL
      contributor: ebook.content.suggestedBy,
      averageRating: ebook.content.averageRating || 0,
      totalRatings: ebook.content.totalRatings || 0,
      description: ebook.description,
      createdAt: ebook.submittedAt,
      updatedAt: ebook.reviewedAt || ebook.submittedAt,
    }));

    return NextResponse.json(ebooksWithDetails);
  } catch (error) {
    console.error('Error fetching e-books:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 