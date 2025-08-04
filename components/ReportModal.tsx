'use client'

import { useState } from 'react'
import { X, AlertTriangle, FileText, Code, BookOpen, Wrench } from 'lucide-react'
import toast from 'react-hot-toast'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  itemType: 'script' | 'tool' | 'ebook'
  itemTitle: string
}

const reportReasons = [
  'Inappropriate content',
  'Malware or harmful code',
  'Copyright violation',
  'Spam or misleading information',
  'Broken or non-functional',
  'Poor quality or incomplete',
  'Security vulnerability',
  'Other'
]

const getItemIcon = (itemType: string) => {
  switch (itemType) {
    case 'script':
      return <Code className="h-5 w-5" />
    case 'tool':
      return <Wrench className="h-5 w-5" />
    case 'ebook':
      return <BookOpen className="h-5 w-5" />
    default:
      return <FileText className="h-5 w-5" />
  }
}

export default function ReportModal({ isOpen, onClose, itemId, itemType, itemTitle }: ReportModalProps) {
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason) {
      toast.error('Please select a reason for the report')
      return
    }

    if (!description.trim()) {
      toast.error('Please provide a description')
      return
    }

    setIsSubmitting(true)

    try {
      const endpoint = `/api/${itemType}s/report`
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          [`${itemType}Id`]: itemId,
          reason,
          description: description.trim()
        }),
      })

      if (response.ok) {
        toast.success('Report submitted successfully!')
        handleClose()
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to submit report')
      }
    } catch (error) {
      console.error('Error submitting report:', error)
      toast.error('Error submitting report')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setReason('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-red-500/20 rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-red-500/20">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-white">Report Issue</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Info */}
          <div className="mb-6 p-4 bg-dark-700 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              {getItemIcon(itemType)}
              <span className="text-sm text-gray-400 capitalize">{itemType}</span>
            </div>
            <h3 className="text-white font-semibold">{itemTitle}</h3>
            <p className="text-gray-400 text-sm">ID: {itemId}</p>
          </div>

          {/* Report Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason for Report *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-dark-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-red-500"
                required
              >
                <option value="">Select a reason...</option>
                {reportReasons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide details about the issue..."
                className="w-full bg-dark-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:border-red-500"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 