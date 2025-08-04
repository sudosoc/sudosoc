'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Wrench, Star, Share2, Flag, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import ReportModal from '@/components/ReportModal'

interface Tool {
  id: string
  title: string
  description: string
  category: string
  platform: string
  url?: string
  contributor?: string
  averageRating: number
  totalRatings: number
}

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedPlatform, setSelectedPlatform] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [ratedTools, setRatedTools] = useState<Set<string>>(new Set())
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; tool: Tool | null }>({
    isOpen: false,
    tool: null
  })

  const categories = [
    'all',
    'network-security',
    'web-security',
    'forensics',
    'malware-analysis',
    'penetration-testing',
    'vulnerability-assessment',
  ]

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '4', label: '4+ Stars' },
    { value: '3', label: '3+ Stars' },
    { value: '2', label: '2+ Stars' },
  ]

  useEffect(() => {
    fetchTools()
  }, [])

  useEffect(() => {
    filterTools()
  }, [tools, searchTerm, selectedCategory, selectedPlatform])

  const fetchTools = async () => {
    try {
      const response = await fetch('/api/tools')
      if (response.ok) {
        const data = await response.json()
        setTools(data)
      }
    } catch (error) {
      console.error('Error fetching tools:', error)
      toast.error('Failed to load tools')
    } finally {
      setIsLoading(false)
    }
  }

  const filterTools = () => {
    let filtered = tools

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tool =>
        tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory)
    }

    // Platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(tool => tool.platform === selectedPlatform)
    }

    setFilteredTools(filtered)
  }

  const handleShare = async (tool: Tool) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: tool.title,
          text: tool.description,
          url: tool.url || window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      const shareText = `${tool.title}: ${tool.description} ${tool.url || window.location.href}`
      await navigator.clipboard.writeText(shareText)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleReport = async (tool: Tool) => {
    setReportModal({ isOpen: true, tool })
  }

  const handleRate = async (toolId: string, rating: number) => {
    // Check if user has already rated this tool
    if (ratedTools.has(toolId)) {
      toast.error('You have already rated this tool before')
      return
    }

    try {
      const response = await fetch('/api/tools/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ toolId, rating }),
      })

      if (response.ok) {
        toast.success(`Rated ${rating} stars!`)
        // Add to rated tools set
        setRatedTools(prev => new Set(Array.from(prev).concat([toolId])))
        // Update the tool's rating in the local state
        setTools(prevTools => 
          prevTools.map(tool => 
            tool.id === toolId 
              ? { 
                  ...tool, 
                  averageRating: (tool.averageRating * tool.totalRatings + rating) / (tool.totalRatings + 1),
                  totalRatings: tool.totalRatings + 1
                }
              : tool
          )
        )
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          toast.error('You have already rated this tool before')
          // Add to rated tools set even if it was already rated
          setRatedTools(prev => new Set(Array.from(prev).concat([toolId])))
        } else {
          toast.error(errorData.message || 'Failed to submit rating')
        }
      }
    } catch (error) {
      toast.error('Error submitting rating')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900/50 border-b border-red-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold neon-glow mb-4">Security Tools</h1>
          <p className="text-gray-400 text-lg">
            Discover and rate the latest cybersecurity tools used by professionals worldwide.
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
                placeholder="Search tools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-10 pr-4 py-2"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-input px-3 py-2"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.replace('-', ' ')}
                </option>
              ))}
            </select>

            {/* Platform Filter */}
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="form-input px-3 py-2"
            >
              <option value="all">All Platforms</option>
              <option value="Windows">Windows</option>
              <option value="Linux">Linux</option>
              <option value="macOS">macOS</option>
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
            </select>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 card-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{tool.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShare(tool)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReport(tool)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Report Issue"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-3">{tool.description}</p>

              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 bg-dark-700 px-2 py-1 rounded">
                  {tool.category.replace('-', ' ')}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-300">
                    {tool.averageRating.toFixed(1)} ({tool.totalRatings})
                  </span>
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(tool.id, star)}
                      className={`text-gray-400 hover:text-yellow-500 transition-colors ${
                        ratedTools.has(tool.id) ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      disabled={ratedTools.has(tool.id)}
                    >
                      <Star className={`h-4 w-4 ${star <= tool.averageRating ? 'text-yellow-500 fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              {tool.url && (
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-400 text-sm"
                >
                  Visit Tool →
                </a>
              )}
            </div>
          ))}
        </div>

        {filteredTools.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No tools found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModal.isOpen && reportModal.tool && (
        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={() => setReportModal({ isOpen: false, tool: null })}
          itemId={reportModal.tool.id}
          itemType="tool"
          itemTitle={reportModal.tool.title}
        />
      )}
    </div>
  )
} 