'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { useRef } from 'react'

const bookSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  author: z.string().min(2, 'Author must be at least 2 characters'),
  field: z.string().min(1, 'Please select a field'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

type BookForm = z.infer<typeof bookSchema>

const fields = [
  'red-team',
  'blue-team',
  'purple-team',
  'forensics',
  'malware-analysis',
  'web-security',
  'network-security',
  'social-engineering',
]

export default function SuggestBookPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BookForm>({
    resolver: zodResolver(bookSchema),
  })

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const onSubmit = async (data: BookForm) => {
    setUploading(true)
    try {
      if (!file) {
        toast.error('Please upload an ebook file (PDF/EPUB)')
        setUploading(false)
        return
      }
      const formData = new FormData()
      formData.append('title', data.title)
      formData.append('author', data.author)
      formData.append('field', data.field)
      formData.append('description', data.description)
      formData.append('file', file)
      const response = await fetch('/api/ebooks/suggest', {
        method: 'POST',
        body: formData,
      })
      if (response.ok) {
        toast.success('Book suggestion submitted successfully! It will be reviewed by our team.')
        router.push('/ebooks')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to submit book suggestion')
      }
    } catch (error) {
      toast.error('An error occurred while submitting the book suggestion')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900/50 border-b border-red-500/20 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold neon-glow">Suggest a Book</h1>
              <p className="text-gray-400 mt-2">
                Help us expand our cybersecurity e-book library
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Book Title
              </label>
              <input
                {...register('title')}
                type="text"
                className="form-input w-full"
                placeholder="Enter book title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Author */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Author
              </label>
              <input
                {...register('author')}
                type="text"
                className="form-input w-full"
                placeholder="Enter author name"
              />
              {errors.author && (
                <p className="mt-1 text-sm text-red-500">{errors.author.message}</p>
              )}
            </div>

            {/* Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Field/Category
              </label>
              <select
                {...register('field')}
                className="form-input w-full"
              >
                <option value="">Select field</option>
                {fields.map(field => (
                  <option key={field} value={field}>
                    {field.replace('-', ' ')}
                  </option>
                ))}
              </select>
              {errors.field && (
                <p className="mt-1 text-sm text-red-500">{errors.field.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={6}
                className="form-input w-full"
                placeholder="Describe the book content, target audience, and why it would be valuable to the community..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-gray-500 rounded-lg p-6 text-center cursor-pointer bg-dark-700 hover:bg-dark-600 mb-4"
            onDrop={handleFileDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            {file ? (
              <span className="text-green-400">{file.name}</span>
            ) : (
              <span className="text-gray-400">Drag & drop your PDF/EPUB here, or click to select</span>
            )}
            <input
              type="file"
              accept=".pdf,.epub"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || uploading}
              className="neon-button px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{isLoading || uploading ? 'Submitting...' : 'Submit Suggestion'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 