'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Code, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'

const scriptSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  language: z.string().min(1, 'Please select a language'),
  type: z.string().min(1, 'Please select a type'),
  code: z.string().min(10, 'Code must be at least 10 characters'),
})

type ScriptForm = z.infer<typeof scriptSchema>

const languages = [
  'python',
  'bash',
  'powershell',
  'javascript',
  'php',
  'ruby',
  'go',
  'rust',
]

const types = [
  'network-scanning',
  'vulnerability-assessment',
  'forensics',
  'malware-analysis',
  'web-security',
  'automation',
]

export default function SubmitScriptPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScriptForm>({
    resolver: zodResolver(scriptSchema),
  })

  const onSubmit = async (data: ScriptForm) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scripts/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Script submitted successfully! It will be reviewed by our team.')
        router.push('/scripts')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to submit script')
      }
    } catch (error) {
      toast.error('An error occurred while submitting the script')
    } finally {
      setIsLoading(false)
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
              <h1 className="text-3xl font-bold neon-glow">Submit a Script</h1>
              <p className="text-gray-400 mt-2">
                Share your security script with the community
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
                Script Title
              </label>
              <input
                {...register('title')}
                type="text"
                className="form-input w-full"
                placeholder="Enter script title"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Language
              </label>
              <select
                {...register('language')}
                className="form-input w-full"
              >
                <option value="">Select language</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              {errors.language && (
                <p className="mt-1 text-sm text-red-500">{errors.language.message}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type
              </label>
              <select
                {...register('type')}
                className="form-input w-full"
              >
                <option value="">Select type</option>
                {types.map(type => (
                  <option key={type} value={type}>
                    {type.replace('-', ' ')}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="form-input w-full"
                placeholder="Describe what your script does..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Code */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Script Code
              </label>
              <div className="relative">
                <textarea
                  {...register('code')}
                  rows={15}
                  className="form-input w-full font-mono text-sm"
                  placeholder="Paste your script code here..."
                />
                <div className="absolute top-2 right-2">
                  <Code className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              {errors.code && (
                <p className="mt-1 text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>
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
              disabled={isLoading}
              className="neon-button px-6 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Upload className="h-4 w-4" />
              <span>{isLoading ? 'Submitting...' : 'Submit Script'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 