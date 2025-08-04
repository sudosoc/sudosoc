'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Code, Star, Share2, Flag, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import ScriptModal from '@/components/ScriptModal'
import ReportModal from '@/components/ReportModal'

interface Script {
  id: string
  title: string
  description: string
  language: string
  type: string
  contributor?: string
  averageRating: number
  totalRatings: number
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<Script[]>([])
  const [filteredScripts, setFilteredScripts] = useState<Script[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState<{ id: string; title: string } | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [ratedScripts, setRatedScripts] = useState<Set<string>>(new Set())
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; script: Script | null }>({
    isOpen: false,
    script: null
  })

  const languages = [
    'all',
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
    'all',
    'network-scanning',
    'vulnerability-assessment',
    'forensics',
    'malware-analysis',
    'web-security',
    'automation',
  ]

  useEffect(() => {
    fetchScripts()
  }, [])

  useEffect(() => {
    filterScripts()
  }, [scripts, searchTerm, selectedLanguage, selectedType])

  const fetchScripts = async () => {
    try {
      const response = await fetch('/api/scripts')
      if (response.ok) {
        const data = await response.json()
        setScripts(data)
      }
    } catch (error) {
      console.error('Error fetching scripts:', error)
      toast.error('Failed to load scripts')
    } finally {
      setIsLoading(false)
    }
  }

  const filterScripts = () => {
    let filtered = scripts

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(script =>
        script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        script.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(script => script.language === selectedLanguage)
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(script => script.type === selectedType)
    }

    setFilteredScripts(filtered)
  }

  const handleShare = async (script: Script) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: script.title,
          text: script.description,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      const shareText = `${script.title}: ${script.description} ${window.location.href}`
      await navigator.clipboard.writeText(shareText)
      toast.success('Link copied to clipboard!')
    }
  }

  const handleReport = (script: Script) => {
    setReportModal({ isOpen: true, script })
  }

  const handleViewCode = (script: Script) => {
    setSelectedScript({ id: script.id, title: script.title })
    setIsModalOpen(true)
  }

  const handleRate = async (scriptId: string, rating: number) => {
    // Check if user has already rated this script
    if (ratedScripts.has(scriptId)) {
      toast.error('You have already rated this script before')
      return
    }

    try {
      const response = await fetch('/api/scripts/rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scriptId, rating }),
      })

      if (response.ok) {
        toast.success(`Rated ${rating} stars!`)
        // Add to rated scripts set
        setRatedScripts(prev => new Set(Array.from(prev).concat([scriptId])))
        // Update the script's rating in the local state
        setScripts(prevScripts => 
          prevScripts.map(script => 
            script.id === scriptId 
              ? { 
                  ...script, 
                  averageRating: (script.averageRating * script.totalRatings + rating) / (script.totalRatings + 1),
                  totalRatings: script.totalRatings + 1
                }
              : script
          )
        )
      } else {
        const errorData = await response.json()
        if (response.status === 409) {
          toast.error('You have already rated this script before')
          // Add to rated scripts set even if it was already rated
          setRatedScripts(prev => new Set(Array.from(prev).concat([scriptId])))
        } else {
          toast.error(errorData.message || 'Failed to submit rating')
        }
      }
    } catch (error) {
      toast.error('Error submitting rating')
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedScript(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading scripts...</p>
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
              <h1 className="text-4xl font-bold neon-glow mb-4">Security Scripts</h1>
              <p className="text-gray-400 text-lg">
                Discover and contribute security scripts for various cybersecurity tasks.
              </p>
            </div>
            <Link
              href="/scripts/submit"
              className="neon-button px-6 py-3 rounded-md flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Submit Script</span>
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
                placeholder="Search scripts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-10 pr-4 py-2"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
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

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="form-input px-3 py-2"
            >
              {types.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.replace('-', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Scripts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map((script) => (
            <div
              key={script.id}
              className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 card-hover"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-white">{script.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleShare(script)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReport(script)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Report Issue"
                  >
                    <Flag className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-300 mb-4 line-clamp-3">{script.description}</p>

              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <span className="text-sm text-gray-400 bg-dark-700 px-2 py-1 rounded">
                    {script.language}
                  </span>
                  <span className="text-sm text-gray-400 bg-dark-700 px-2 py-1 rounded">
                    {script.type.replace('-', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-300">
                    {script.averageRating.toFixed(1)} ({script.totalRatings})
                  </span>
                </div>
              </div>

              {script.contributor && (
                <p className="text-xs text-gray-400 mb-4">
                  By: {script.contributor}
                </p>
              )}

              {/* Rating Stars */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRate(script.id, star)}
                      className={`text-gray-400 hover:text-yellow-500 transition-colors ${
                        ratedScripts.has(script.id) ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                      disabled={ratedScripts.has(script.id)}
                    >
                      <Star className={`h-4 w-4 ${star <= script.averageRating ? 'text-yellow-500 fill-current' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => handleViewCode(script)}
                className="text-red-500 hover:text-red-400 text-sm flex items-center space-x-1"
              >
                <Code className="h-4 w-4" />
                <span>View Code</span>
              </button>
            </div>
          ))}
        </div>

        {filteredScripts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No scripts found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Script Modal */}
      {selectedScript && (
        <ScriptModal
          isOpen={isModalOpen}
          onClose={closeModal}
          scriptId={selectedScript.id}
          scriptTitle={selectedScript.title}
        />
      )}

      {/* Report Modal */}
      {reportModal.isOpen && reportModal.script && (
        <ReportModal
          isOpen={reportModal.isOpen}
          onClose={() => setReportModal({ isOpen: false, script: null })}
          itemId={reportModal.script.id}
          itemType="script"
          itemTitle={reportModal.script.title}
        />
      )}
    </div>
  )
} 