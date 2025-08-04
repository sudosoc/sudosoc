'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Edit, Save, X, Star, Share2, Code, BookOpen, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface UserProfile {
  id: string
  username: string
  email: string
  bio?: string
  avatar?: string
  stats: {
    scriptsSubmitted: number
    likesGiven: number
    sharesMade: number
    contributions: number
    reportsSubmitted: number
  }
  submissions?: Array<{
    id: string
    type: 'script' | 'tool' | 'ebook' | 'article'
    title: string
    description: string
    status: 'pending' | 'approved' | 'rejected'
    submittedAt: Date
    reviewedAt?: Date
    reviewNotes?: string
  }>
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editForm, setEditForm] = useState({
    username: '',
    bio: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        const userProfile: UserProfile = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          bio: 'Cybersecurity enthusiast and penetration tester. Love exploring new tools and sharing knowledge with the community.',
          stats: data.user.stats,
          submissions: data.user.submissions || [],
        }
        setProfile(userProfile)
        setEditForm({
          username: userProfile.username,
          bio: userProfile.bio || '',
        })
      } else {
        toast.error('Failed to load profile')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        fetchProfile() // Refresh profile data
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Error updating profile')
    }
  }

  const handleCancel = () => {
    setEditForm({
      username: profile?.username || '',
      bio: profile?.bio || '',
    })
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Profile not found</p>
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
            <h1 className="text-4xl font-bold neon-glow">Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="neon-button px-4 py-2 rounded-md flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-red-500/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="h-12 w-12 text-red-500" />
                </div>
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="form-input w-full text-center text-lg font-semibold"
                    />
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows={3}
                      className="form-input w-full text-center"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={handleSave}
                        className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors flex items-center space-x-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        className="border border-gray-600 text-gray-300 px-4 py-2 rounded-md hover:border-gray-500 transition-colors flex items-center space-x-1"
                      >
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2">{profile.username}</h2>
                    <p className="text-gray-300 text-sm">{profile.bio}</p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-600 pt-4">
                <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Scripts Submitted</span>
                    <span className="text-white font-semibold">{profile.stats.scriptsSubmitted}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Likes Given</span>
                    <span className="text-white font-semibold">{profile.stats.likesGiven}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Shares Made</span>
                    <span className="text-white font-semibold">{profile.stats.sharesMade}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Contributions</span>
                    <span className="text-white font-semibold">{profile.stats.contributions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Reports Submitted</span>
                    <span className="text-white font-semibold">{profile.stats.reportsSubmitted}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-2">
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
              
              <div className="space-y-4">
                {profile?.stats.scriptsSubmitted > 0 && (
                  <div className="flex items-start space-x-3 p-4 bg-dark-700/50 rounded-lg">
                    <Code className="h-5 w-5 text-red-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-white">Submitted <span className="text-red-400">{profile.stats.scriptsSubmitted} script{profile.stats.scriptsSubmitted !== 1 ? 's' : ''}</span></p>
                      <p className="text-gray-400 text-sm">Your contributions to the community</p>
                    </div>
                  </div>
                )}

                {profile?.stats.likesGiven > 0 && (
                  <div className="flex items-start space-x-3 p-4 bg-dark-700/50 rounded-lg">
                    <Star className="h-5 w-5 text-yellow-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-white">Given <span className="text-red-400">{profile.stats.likesGiven} rating{profile.stats.likesGiven !== 1 ? 's' : ''}</span></p>
                      <p className="text-gray-400 text-sm">Your feedback on tools and scripts</p>
                    </div>
                  </div>
                )}

                {profile?.stats.sharesMade > 0 && (
                  <div className="flex items-start space-x-3 p-4 bg-dark-700/50 rounded-lg">
                    <Share2 className="h-5 w-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-white">Shared <span className="text-red-400">{profile.stats.sharesMade} item{profile.stats.sharesMade !== 1 ? 's' : ''}</span></p>
                      <p className="text-gray-400 text-sm">Content you've shared with others</p>
                    </div>
                  </div>
                )}

                {profile?.stats.reportsSubmitted > 0 && (
                  <div className="flex items-start space-x-3 p-4 bg-dark-700/50 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-white">Submitted <span className="text-red-400">{profile.stats.reportsSubmitted} report{profile.stats.reportsSubmitted !== 1 ? 's' : ''}</span></p>
                      <p className="text-gray-400 text-sm">Issues you've reported to help improve the platform</p>
                    </div>
                  </div>
                )}

                {profile?.stats.contributions === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No activity yet. Start contributing to see your activity here!</p>
                    <div className="mt-4 space-x-4">
                      <Link href="/scripts/submit" className="text-red-500 hover:text-red-400">
                        Submit a Script
                      </Link>
                      <Link href="/tools" className="text-red-500 hover:text-red-400">
                        Rate Tools
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submissions Section */}
            {profile?.submissions && profile.submissions.length > 0 && (
              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 mt-6">
                <h3 className="text-xl font-semibold text-white mb-6">My Submissions</h3>
                
                <div className="space-y-4">
                  {profile.submissions.map((submission) => (
                    <div key={submission.id} className="bg-dark-700/50 border border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {submission.type === 'script' && <Code className="h-4 w-4 text-red-500" />}
                            {submission.type === 'ebook' && <BookOpen className="h-4 w-4 text-green-500" />}
                            {submission.type === 'tool' && <FileText className="h-4 w-4 text-blue-500" />}
                            <h4 className="text-white font-semibold">{submission.title}</h4>
                          </div>
                          <p className="text-gray-300 text-sm mb-2">{submission.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-400">
                            <span>Type: {submission.type}</span>
                            <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                            {submission.reviewedAt && (
                              <span>Reviewed: {new Date(submission.reviewedAt).toLocaleDateString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4">
                          {submission.status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs rounded-full">
                              Pending Review
                            </span>
                          )}
                          {submission.status === 'approved' && (
                            <span className="px-2 py-1 bg-green-600 text-green-100 text-xs rounded-full">
                              Approved
                            </span>
                          )}
                          {submission.status === 'rejected' && (
                            <span className="px-2 py-1 bg-red-600 text-red-100 text-xs rounded-full">
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>
                      {submission.reviewNotes && (
                        <div className="mt-3 p-3 bg-dark-600 rounded text-sm">
                          <p className="text-gray-300"><strong>Review Notes:</strong> {submission.reviewNotes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 