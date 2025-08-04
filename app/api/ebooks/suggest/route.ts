import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import path from 'path'
import fs from 'fs/promises'

export async function POST(request: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const author = formData.get('author') as string;
    const field = formData.get('field') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;

    if (!title || !author || !field || !description || !file) {
      return NextResponse.json({ message: 'All fields and file are required' }, { status: 400 });
    }

    // Save the file to public/uploads/ebooks/
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ebooks');
    await fs.mkdir(uploadsDir, { recursive: true });
    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
    const filePath = path.join(uploadsDir, fileName);
    await fs.writeFile(filePath, buffer);
    const fileUrl = `/uploads/ebooks/${fileName}`;

    const authToken = request.cookies.get('auth-token')?.value;
    if (!authToken) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }
    const user = await auth.getUserById(authToken);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const submission = await auth.addSubmission({
      type: 'ebook',
      title,
      description,
      content: { author, field, suggestedBy: user.username, fileUrl },
      submittedBy: user.id,
    });

    return NextResponse.json(
      {
        message: 'Book suggestion submitted successfully and sent for review',
        suggestion: {
          id: submission.id, title, author, field, description, fileUrl,
          isApproved: false, createdAt: new Date(),
        },
        submissionId: submission.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Book suggestion error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 