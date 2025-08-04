'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, BookOpen, Download, ExternalLink, Star, Filter, Plus, Flag } from 'lucide-react'
import toast from 'react-hot-toast'
import ReportModal from '@/components/ReportModal'

interface EBook {
  id: string
  title: string
  author: string
  field: string
  pageCount: number
  language: string
  coverUrl?: string
  pdfUrl: string
  contributor?: string
  averageRating: number
  totalRatings: number
  description: string
}

export default function EBooksPage() {
  const [ebooks, setEbooks] = useState<EBook[]>([])
  const [filteredEbooks, setFilteredEbooks] = useState<EBook[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedField, setSelectedField] = useState('all')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [ratedEbooks, setRatedEbooks] = useState<Set<string>>(new Set())
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; ebook: EBook | null }>({
    isOpen: false,
    ebook: null
  })

  const fields = [
    'all',
    'red-team',
    'blue-team',
    'purple-team',
    'forensics',
    'malware-analysis',
    'web-security',
    'network-security',
    'social-engineering',
  ]

  const languages = [
    'all',
    'english',
    'spanish',
    'french',
    'german',
    'chinese',
    'japanese',
  ]

  useEffect(() => {
    fetchEBooks()
  }, [])

  useEffect(() => {
    filterEBooks()
  }, [ebooks, searchTerm, selectedField, selectedLanguage])

  const fetchEBooks = async () => {
    try {
      const response = await fetch('/api/ebooks')
      if (response.ok) {
        const data = await response.json()
        setEbooks(data)
      }
    } catch (error) {
      console.error('Error fetching e-books:', error)
      toast.error('Failed to load e-books')
    } finally {
      setIsLoading(false)
    }
  }

  const filterEBooks = () => {
    let filtered = ebooks

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(ebook =>
        ebook.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ebook.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Field filter
    if (selectedField !== 'all') {
      filtered = filtered.filter(ebook => ebook.field === selectedField)
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(ebook => ebook.language === selectedLanguage)
    }

    setFilteredEbooks(filtered)
  }

  const handleDownload = async (ebook: EBook) => {
    try {
      toast.success(`Downloading ${ebook.title}...`)
      
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = ebook.pdfUrl
      link.download = `${ebook.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Simulate download delay
      setTimeout(() => {
        toast.success('Download completed!')
      }, 2000)
    } catch (error) {
      toast.error('Download failed')
    }
  }

  const handleOpenInNewTab = (ebook: EBook) => {
    // Open the PDF in a new tab for viewing
    window.open(ebook.pdfUrl, '_blank')
  }

  const handleRate = async (ebookId: string, rating: number) => {
    // Check if user has already rated this ebook
    if (ratedEbooks.has(ebookId)) {
      toast.error('You have already rated this ebook before')
      return
    }

    try {
      const response = await fetch('/api/ebooks/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ebookId, rating }),
      })

      if (response.ok) {
        toast.success(`Rated ${rating} stars!`)
        // Add to rated ebooks set
        setRatedEbooks(prev => new Set(Array.from(prev).concat([ebookId])))
        // Update the ebook's rating in the local state
        setEbooks(prevEbooks => 
          prevEbooks.map((ebook: EBook) => 
            ebook.id === ebookId 
              ? { 
                  ...ebook, 
                  averageRating: (ebook.averageRating * ebook.totalRatings + rating) / (ebook.totalRatings + 1),
                  totalRatings: ebook.totalRatings + 1
                }
              : ebook
          )
        )
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          toast.error('You have already rated this ebook before')
          // Add to rated ebooks set even if it was already rated
          setRatedEbooks(prev => new Set(Array.from(prev).concat([ebookId])))
        } else {
          toast.error(errorData.message || 'Failed to submit rating')
        }
      }
    } catch (error) {
      toast.error('Error submitting rating')
    }
  }

  const handleReport = (ebook: EBook) => {
    setReportModal({ isOpen: true, ebook })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading e-books...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900/50 border-b border-red-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold neon-glow mb-4">E-Books Library</h1>
              <p className="text-gray-400 text-lg">
                Download free cybersecurity e-books covering various aspects of security research.
              </p>
            </div>
            <Link
              href="/ebooks/suggest"
              className="neon-button px-6 py-3 rounded-md flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Suggest Book</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search e-books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-10 pr-4 py-2"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="form-input px-3 py-2"
            >
              {fields.map(field => (
                <option key={field} value={field}>
                  {field === 'all' ? 'All Fields' : field.replace('-', ' ')}
                </option>
              ))}
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="form-input px-3 py-2"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>
                  {lang === 'all' ? 'All Languages' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* E-Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEbooks.map((ebook) => (
            <div
              key={ebook.id}
              className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 card-hover"
            >
              {/* Cover Image */}
              <div className="mb-4">
                {ebook.coverUrl ? (
                  <img
                    src={ebook.coverUrl}
                    alt={ebook.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-dark-700 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{ebook.title}</h3>
              <p className="text-gray-300 text-sm mb-2">By {ebook.author}</p>
              
              {/* Description */}
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {ebook.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-400 bg-dark-700 px-2 py-1 rounded">
                    {ebook.field.replace('-', ' ')}
                  </span>
                  {ebook.pageCount > 0 && (
                    <span className="text-sm text-gray-400 bg-dark-700 px-2 py-1 rounded">
                      {ebook.pageCount} pages
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-300">
                    {ebook.averageRating.toFixed(1)} ({ebook.totalRatings})
                  </span>
                </div>
              </div>

              {ebook.contributor && (
                <p className="text-xs text-gray-400 mb-4">
                  Suggested by: {ebook.contributor}
                </p>
              )}

              {/* Rating Stars */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(ebook.id, star)}
                      className={`text-gray-400 hover:text-yellow-500 transition-colors ${
                        ratedEbooks.has(ebook.id) ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      disabled={ratedEbooks.has(ebook.id)}
                    >
                      <Star className={`h-4 w-4 ${star <= ebook.averageRating ? 'text-yellow-500 fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownload(ebook)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => handleOpenInNewTab(ebook)}
                  className="neon-button px-4 py-2 rounded-md flex items-center justify-center"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleReport(ebook)}
                  className="text-gray-400 hover:text-red-500 transition-colors px-2 py-2 rounded-md"
                  title="Report Issue"
                >
                  <Flag className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEbooks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No e-books found matching your criteria.</p>
            <p className="text-gray-500 text-sm mt-2">
              Be the first to suggest a book by clicking the "Suggest Book" button above.
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModal.isOpen && reportModal.ebook && (
        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={() => setReportModal({ isOpen: false, ebook: null })}
          itemId={reportModal.ebook.id}
          itemType="ebook"
          itemTitle={reportModal.ebook.title}
        />
      )}
    </div>
  )
} 