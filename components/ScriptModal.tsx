'use client'

import { useState, useEffect } from 'react'
import { X, Copy, Download } from 'lucide-react'
import toast from 'react-hot-toast'

interface ScriptModalProps {
  isOpen: boolean
  onClose: () => void
  scriptId: string
  scriptTitle: string
}

interface ScriptDetails {
  id: string
  title: string
  description: string
  language: string
  type: string
  sourceCode: string
  contributor?: string
}

export default function ScriptModal({ isOpen, onClose, scriptId, scriptTitle }: ScriptModalProps) {
  const [script, setScript] = useState<ScriptDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && scriptId) {
      fetchScriptDetails()
    }
  }, [isOpen, scriptId])

  const fetchScriptDetails = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/scripts/${scriptId}`)
      if (response.ok) {
        const data = await response.json()
        setScript(data)
      } else {
        toast.error('Failed to load script details')
      }
    } catch (error) {
      console.error('Error fetching script details:', error)
      toast.error('Error loading script details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (script?.sourceCode) {
      try {
        await navigator.clipboard.writeText(script.sourceCode)
        toast.success('Code copied to clipboard!')
      } catch (error) {
        toast.error('Failed to copy code')
      }
    }
  }

  const handleDownloadCode = () => {
    if (script?.sourceCode) {
      const blob = new Blob([script.sourceCode], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${script.title.replace(/[^a-zA-Z0-9]/g, '_')}.${getFileExtension(script.language)}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Code downloaded!')
    }
  }

  const getFileExtension = (language: string) => {
    const extensions: { [key: string]: string } = {
      python: 'py',
      bash: 'sh',
      powershell: 'ps1',
      javascript: 'js',
      php: 'php',
      ruby: 'rb',
      go: 'go',
      rust: 'rs'
    }
    return extensions[language] || 'txt'
  }

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      python: 'text-blue-400',
      bash: 'text-green-400',
      powershell: 'text-blue-500',
      javascript: 'text-yellow-400',
      php: 'text-purple-400',
      ruby: 'text-red-400',
      go: 'text-cyan-400',
      rust: 'text-orange-400'
    }
    return colors[language] || 'text-gray-400'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-dark-800 border border-red-500/20 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-red-500/20">
          <div>
            <h2 className="text-2xl font-bold text-white">{scriptTitle}</h2>
            {script && (
              <div className="flex items-center space-x-4 mt-2">
                <span className={`text-sm ${getLanguageColor(script.language)}`}>
                  {script.language.toUpperCase()}
                </span>
                <span className="text-sm text-gray-400 bg-dark-700 px-2 py-1 rounded">
                  {script.type.replace('-', ' ')}
                </span>
                {script.contributor && (
                  <span className="text-sm text-gray-400">
                    By: {script.contributor}
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-400">Loading script...</span>
            </div>
          ) : script ? (
            <div className="space-y-4">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300">{script.description}</p>
              </div>

              {/* Source Code */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-white">Source Code</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleCopyCode}
                      className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <Copy className="h-4 w-4" />
                      <span>Copy</span>
                    </button>
                    <button
                      onClick={handleDownloadCode}
                      className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
                <div className="bg-dark-900 border border-red-500/20 rounded-lg p-4">
                  <pre className="text-sm text-gray-300 overflow-x-auto">
                    <code>{script.sourceCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Failed to load script details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 