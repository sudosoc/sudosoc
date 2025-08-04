'use client'

import { useState, useEffect } from 'react'
import { Search, FileText, ExternalLink, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'

interface JournalEntry {
  id: string
  title: string
  content: string
  sourceUrl?: string
  tags: string[]
  publishedAt: string
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  const availableTags = [
    'all',
    'cve',
    'exploit',
    'vulnerability',
    'malware',
    'phishing',
    'ransomware',
    'apt',
    'zero-day',
    'breach',
  ]

  useEffect(() => {
    fetchJournalEntries()
  }, [])

  useEffect(() => {
    filterEntries()
  }, [entries, searchTerm, selectedTag])

  const fetchJournalEntries = async () => {
    try {
      const response = await fetch('/api/journal')
      if (response.ok) {
        const data = await response.json()
        setEntries(data)
      }
    } catch (error) {
      console.error('Error fetching journal entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterEntries = () => {
    let filtered = entries

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Tag filter
    if (selectedTag !== 'all') {
      filtered = filtered.filter(entry => entry.tags.includes(selectedTag))
    }

    setFilteredEntries(filtered)
  }

  const handleOpenSource = (url: string) => {
    window.open(url, '_blank')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading journal entries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900/50 border-b border-red-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold neon-glow mb-4">Security Journal</h1>
          <p className="text-gray-400 text-lg">
            Stay updated with curated CVE reports and security research articles.
          </p>
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
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-10 pr-4 py-2"
              />
            </div>
          </div>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="form-input px-3 py-2"
          >
            {availableTags.map(tag => (
              <option key={tag} value={tag}>
                {tag === 'all' ? 'All Tags' : tag.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Journal Entries */}
        <div className="space-y-6">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 card-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{entry.title}</h3>
                {entry.sourceUrl && (
                  <button
                    onClick={() => handleOpenSource(entry.sourceUrl!)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="View Source"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </button>
                )}
              </div>

              <p className="text-gray-300 mb-4 line-clamp-3">
                {entry.content.length > 200
                  ? `${entry.content.substring(0, 200)}...`
                  : entry.content}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1 text-gray-400 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(entry.publishedAt), 'MMM dd, yyyy')}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {entry.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded"
                      >
                        {tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="text-red-500 hover:text-red-400 text-sm">
                  Read More →
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No journal entries found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
} 