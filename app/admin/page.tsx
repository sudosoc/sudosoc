'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Users, 
  Code, 
  BookOpen, 
  Wrench, 
  FileText, 
  Star, 
  AlertTriangle,
  Settings,
  BarChart3,
  Activity,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  Ban
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import AnalyticsCharts, { UserActivityChart } from '@/components/AnalyticsCharts'


interface Submission {
  id: string
  type: 'script' | 'tool' | 'ebook' | 'article'
  title: string
  description: string
  content: any
  submittedBy: string
  submittedAt: Date
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: Date
  reviewNotes?: string
}

interface User {
  id: string
  username: string
  email: string
  isAdmin: boolean
  createdAt: Date
  stats: {
    scriptsSubmitted: number
    likesGiven: number
    sharesMade: number
    contributions: number
    reportsSubmitted: number
  }
  isBanned?: boolean
  contributions: {
    reports: Array<{ itemId: string; itemType: string; reason?: string; description?: string }>;
    ratings: Array<{ itemId: string; itemType: string; rating: number }>;
  };
}

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  pendingSubmissions: number
  approvedSubmissions: number
  rejectedSubmissions: number
  totalScripts: number
  totalTools: number
  totalEbooks: number
  totalReports: number
  totalRatings: number
  submissionTrends: Array<{
    date: string
    total: number
    scripts: number
    tools: number
    ebooks: number
  }>
  submissionTypes: Array<{
    name: string
    value: number
    color: string
  }>
  submissionStatuses: Array<{
    name: string
    value: number
    color: string
  }>
  userActivity: Array<{
    username: string
    submissions: number
    ratings: number
    contributions: number
  }>
  monthlyGrowth: number
  thisMonthSubmissions: number
  lastMonthSubmissions: number
}

type AdminTab = 'analytics' | 'users' | 'scripts' | 'tools' | 'ebooks' | 'reports' | 'ratings' | 'activity'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    pendingSubmissions: 0,
    approvedSubmissions: 0,
    rejectedSubmissions: 0,
    totalScripts: 0,
    totalTools: 0,
    totalEbooks: 0,
    totalReports: 0,
    totalRatings: 0,
    submissionTrends: [],
    submissionTypes: [],
    submissionStatuses: [],
    userActivity: [],
    monthlyGrowth: 0,
    thisMonthSubmissions: 0,
    lastMonthSubmissions: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editUserData, setEditUserData] = useState<Partial<User>>({})
  const [reviewNotes, setReviewNotes] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  
  // New state for report and rating actions
  const [selectedReport, setSelectedReport] = useState<{user: User, report: any, index: number} | null>(null)
  const [selectedRating, setSelectedRating] = useState<{user: User, rating: any, index: number} | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{type: 'report' | 'rating', data: any} | null>(null)
  
  const { user } = useAuth()

  useEffect(() => {
    if (user?.isAdmin) {
      fetchDashboardData()
    }
  }, [user])

  // Debug: Log ratings count
  useEffect(() => {
    if (activeTab === 'ratings') {
      const totalRatings = users.reduce((total, user) => total + user.contributions.ratings.length, 0)
      console.log('Total ratings to display:', totalRatings)
      users.forEach(user => {
        if (user.contributions.ratings.length > 0) {
          console.log(`${user.username} has ${user.contributions.ratings.length} ratings:`, user.contributions.ratings)
        }
      })
    }
  }, [activeTab, users])

  const fetchDashboardData = async () => {
    try {
      const [submissionsRes, usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/submissions'),
        fetch('/api/admin/users'),
        fetch('/api/admin/stats')
      ])

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        setSubmissions(submissionsData.submissions || [])
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users || [])
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewNotes }),
      })

      if (response.ok) {
        toast.success('Submission approved successfully!')
        setSelectedSubmission(null)
        setReviewNotes('')
        fetchDashboardData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to approve submission')
      }
    } catch (error) {
      toast.error('Error approving submission')
    }
  }

  const handleReject = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/admin/submissions/${submissionId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reviewNotes }),
      })

      if (response.ok) {
        toast.success('Submission rejected successfully!')
        setSelectedSubmission(null)
        setReviewNotes('')
        fetchDashboardData()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to reject submission')
      }
    } catch (error) {
      toast.error('Error rejecting submission')
    }
  }

  const handleBanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/ban`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('User banned successfully!')
        fetchDashboardData()
      } else {
        toast.error('Failed to ban user')
      }
    } catch (error) {
      toast.error('Error banning user')
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/unban`, {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('User unbanned successfully!')
        fetchDashboardData()
      } else {
        toast.error('Failed to unban user')
      }
    } catch (error) {
      toast.error('Error unbanning user')
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsEditMode(false)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditUserData({
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      isBanned: user.isBanned
    })
    setIsEditMode(true)
  }

  const handleSaveUser = async () => {
    if (!selectedUser) return

    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editUserData),
      })

      if (response.ok) {
        toast.success('User updated successfully!')
        setSelectedUser(null)
        setIsEditMode(false)
        setEditUserData({})
        fetchDashboardData()
      } else {
        toast.error('Failed to update user')
      }
    } catch (error) {
      toast.error('Error updating user')
    }
  }

  const handleCloseUserModal = () => {
    setSelectedUser(null)
    setIsEditMode(false)
    setEditUserData({})
  }

  // Report and Rating action handlers
  const handleViewReport = (user: User, report: any, index: number) => {
    setSelectedReport({ user, report, index })
    setShowReportModal(true)
  }

  const handleResolveReport = async (user: User, report: any, index: number) => {
    try {
      const response = await fetch(`/api/admin/reports/${user.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, reportIndex: index }),
      })

      if (response.ok) {
        // Remove the report from user's contributions
        const updatedUsers = users.map(u => {
          if (u.id === user.id) {
            const updatedReports = [...u.contributions.reports]
            updatedReports.splice(index, 1)
            return {
              ...u,
              contributions: {
                ...u.contributions,
                reports: updatedReports
              }
            }
          }
          return u
        })
        
        // Update the state
        setUsers(updatedUsers)
        toast.success('Report resolved successfully!')
      } else {
        toast.error('Failed to resolve report')
      }
    } catch (error) {
      toast.error('Failed to resolve report')
    }
  }

  const handleDismissReport = async (user: User, report: any, index: number) => {
    try {
      const response = await fetch(`/api/admin/reports/${user.id}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id, reportIndex: index }),
      })

      if (response.ok) {
        // Remove the report from user's contributions
        const updatedUsers = users.map(u => {
          if (u.id === user.id) {
            const updatedReports = [...u.contributions.reports]
            updatedReports.splice(index, 1)
            return {
              ...u,
              contributions: {
                ...u.contributions,
                reports: updatedReports
              }
            }
          }
          return u
        })
        
        // Update the state
        setUsers(updatedUsers)
        toast.success('Report dismissed successfully!')
      } else {
        toast.error('Failed to dismiss report')
      }
    } catch (error) {
      toast.error('Failed to dismiss report')
    }
  }

  const handleViewRating = (user: User, rating: any, index: number) => {
    setSelectedRating({ user, rating, index })
    setShowRatingModal(true)
  }

  const handleDeleteRating = (user: User, rating: any, index: number) => {
    setDeleteTarget({ type: 'rating', data: { user, rating, index } })
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return

    try {
      if (deleteTarget.type === 'rating') {
        const { user, rating, index } = deleteTarget.data
        
        const response = await fetch(`/api/admin/ratings/${user.id}/delete`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id, ratingIndex: index }),
        })

        if (response.ok) {
          // Remove the rating from user's contributions
          const updatedUsers = users.map(u => {
            if (u.id === user.id) {
              const updatedRatings = [...u.contributions.ratings]
              updatedRatings.splice(index, 1)
              return {
                ...u,
                contributions: {
                  ...u.contributions,
                  ratings: updatedRatings
                }
              }
            }
            return u
          })
          
          // Update the state
          setUsers(updatedUsers)
          toast.success('Rating deleted successfully!')
        } else {
          toast.error('Failed to delete rating')
        }
      }
      
      setShowDeleteConfirmation(false)
      setDeleteTarget(null)
    } catch (error) {
      toast.error('Failed to delete rating')
    }
  }

  const handleCloseReportModal = () => {
    setShowReportModal(false)
    setSelectedReport(null)
  }

  const handleCloseRatingModal = () => {
    setShowRatingModal(false)
    setSelectedRating(null)
  }

  const getSubmissionIcon = (type: string) => {
    switch (type) {
      case 'script':
        return <Code className="h-5 w-5" />
      case 'tool':
        return <Wrench className="h-5 w-5" />
      case 'ebook':
        return <BookOpen className="h-5 w-5" />
      case 'article':
        return <FileText className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-600 text-yellow-100'
      case 'approved':
        return 'bg-green-600 text-green-100'
      case 'rejected':
        return 'bg-red-600 text-red-100'
      default:
        return 'bg-gray-600 text-gray-100'
    }
  }

  const exportData = () => {
    try {
      // Create CSV content for all data
      const csvContent = [
        // Users data
        ['USERS DATA'],
        ['Username', 'Email', 'Is Admin', 'Is Banned', 'Created At', 'Scripts Submitted', 'Likes Given', 'Shares Made', 'Contributions', 'Reports Submitted'],
        ...users.map(user => [
          user.username,
          user.email,
          user.isAdmin ? 'Yes' : 'No',
          user.isBanned ? 'Yes' : 'No',
          new Date(user.createdAt).toLocaleDateString(),
          user.stats.scriptsSubmitted,
          user.stats.likesGiven,
          user.stats.sharesMade,
          user.stats.contributions,
          user.stats.reportsSubmitted
        ]),
        [],
        // Submissions data
        ['SUBMISSIONS DATA'],
        ['ID', 'Type', 'Title', 'Description', 'Submitted By', 'Status', 'Submitted At', 'Reviewed By', 'Reviewed At'],
        ...submissions.map(sub => [
          sub.id,
          sub.type,
          sub.title,
          sub.description,
          sub.submittedBy,
          sub.status,
          new Date(sub.submittedAt).toLocaleDateString(),
          sub.reviewedBy || 'N/A',
          sub.reviewedAt ? new Date(sub.reviewedAt).toLocaleDateString() : 'N/A'
        ]),
        [],
        // Stats data
        ['PLATFORM STATISTICS'],
        ['Metric', 'Value'],
        ['Total Users', stats.totalUsers],
        ['Active Users', stats.activeUsers],
        ['Banned Users', stats.bannedUsers],
        ['Pending Submissions', stats.pendingSubmissions],
        ['Approved Submissions', stats.approvedSubmissions],
        ['Rejected Submissions', stats.rejectedSubmissions],
        ['Total Scripts', stats.totalScripts],
        ['Total Tools', stats.totalTools],
        ['Total E-Books', stats.totalEbooks],
        ['Total Ratings', stats.totalRatings],
        ['Monthly Growth (%)', stats.monthlyGrowth]
      ].map(row => row.join(',')).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `sudosoc_data_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    }
  }

  const exportActivity = () => {
    try {
      // Create CSV content for activity data
      const csvContent = [
        // User Activity data
        ['USER ACTIVITY DATA'],
        ['Username', 'Submissions', 'Ratings', 'Contributions'],
        ...stats.userActivity.map(user => [
          user.username,
          user.submissions,
          user.ratings,
          user.contributions
        ]),
        [],
        // Submission Trends data
        ['SUBMISSION TRENDS (Last 30 Days)'],
        ['Date', 'Total', 'Scripts', 'Tools', 'E-Books'],
        ...stats.submissionTrends.map(trend => [
          trend.date,
          trend.total,
          trend.scripts,
          trend.tools,
          trend.ebooks
        ]),
        [],
        // Submission Types distribution
        ['SUBMISSION TYPES DISTRIBUTION'],
        ['Type', 'Count', 'Color'],
        ...stats.submissionTypes.map(type => [
          type.name,
          type.value,
          type.color
        ]),
        [],
        // Submission Statuses distribution
        ['SUBMISSION STATUSES DISTRIBUTION'],
        ['Status', 'Count', 'Color'],
        ...stats.submissionStatuses.map(status => [
          status.name,
          status.value,
          status.color
        ]),
        [],
        // Activity Summary
        ['ACTIVITY SUMMARY'],
        ['Metric', 'Value'],
        ['Active Contributors', stats.userActivity.filter(u => u.submissions > 0).length],
        ['Total Ratings', stats.userActivity.reduce((sum, u) => sum + u.ratings, 0)],
        ['Top Contributor', stats.userActivity.length > 0 ? stats.userActivity[0].username : 'N/A'],
        ['Avg Submissions per User', stats.userActivity.length > 0 
          ? Math.round(stats.userActivity.reduce((sum, u) => sum + u.submissions, 0) / stats.userActivity.length)
          : 0
        ],
        ['This Month Submissions', stats.thisMonthSubmissions],
        ['Last Month Submissions', stats.lastMonthSubmissions],
        ['Monthly Growth (%)', stats.monthlyGrowth]
      ].map(row => row.join(',')).join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `sudosoc_activity_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success('Activity data exported successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export activity data')
    }
  }

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || submission.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredUsers = users.filter(user => {
    return user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'scripts', label: 'Scripts', icon: Code },
    { id: 'tools', label: 'Tools', icon: Wrench },
    { id: 'ebooks', label: 'E-Books', icon: BookOpen },
    { id: 'reports', label: 'Reports', icon: AlertTriangle },
    { id: 'ratings', label: 'Ratings', icon: Star },
    { id: 'activity', label: 'Activity', icon: Activity },
  ]

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <div className="bg-dark-900/50 border-b border-red-500/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold neon-glow">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={exportData}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                <Download className="h-4 w-4 mr-2 inline" />
                Export Data
              </button>
            </div>
          </div>
          <p className="text-gray-400 mt-2">
            Complete platform management and analytics
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-dark-800 rounded-lg p-1 mb-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-red-500 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in-up">
            {/* Additional Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 animate-scale-in">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-500">
                      {stats.activeUsers} active • {stats.bannedUsers} banned
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 animate-scale-in">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">Total E-Books</p>
                    <p className="text-2xl font-bold text-white">{stats.totalEbooks}</p>
                    <p className="text-xs text-gray-500">
                      {stats.submissionStatuses.find(s => s.name === 'Approved')?.value || 0} approved
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 animate-scale-in">
                <div className="flex items-center">
                  <Wrench className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Tools</p>
                    <p className="text-2xl font-bold text-white">{stats.totalTools}</p>
                    <p className="text-xs text-gray-500">
                      {stats.submissionStatuses.find(s => s.name === 'Approved')?.value || 0} approved
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 animate-scale-in">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Ratings</p>
                    <p className="text-2xl font-bold text-white">{stats.totalRatings}</p>
                    <p className="text-xs text-gray-500">
                      Across all content
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <AnalyticsCharts
              submissionTypes={stats.submissionTypes}
              submissionStatuses={stats.submissionStatuses}
              submissionTrends={stats.submissionTrends}
              userActivity={stats.userActivity}
              monthlyGrowth={stats.monthlyGrowth}
              thisMonthSubmissions={stats.thisMonthSubmissions}
              lastMonthSubmissions={stats.lastMonthSubmissions}
            />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">User Management</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                </div>
                <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                  <Download className="h-4 w-4 mr-2 inline" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contributions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-dark-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-white">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isAdmin ? 'bg-red-600 text-red-100' : 'bg-gray-600 text-gray-100'
                          }`}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {user.stats.contributions}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            user.isBanned ? 'bg-red-600 text-red-100' : 'bg-green-600 text-green-100'
                          }`}>
                            {user.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="text-blue-500 hover:text-blue-400"
                            title="View User"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-yellow-500 hover:text-yellow-400"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {user.isBanned ? (
                            <button 
                              onClick={() => handleUnbanUser(user.id)}
                              className="text-green-500 hover:text-green-400"
                            >
                              <UserCheck className="h-4 w-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleBanUser(user.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Scripts Tab */}
        {activeTab === 'scripts' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Script Management</h2>
              <div className="flex space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search scripts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-dark-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 bg-dark-700 border border-gray-600 rounded-md text-white focus:outline-none focus:border-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                  <Download className="h-4 w-4 mr-2 inline" />
                  Export
                </button>
              </div>
            </div>

            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Script</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredSubmissions.filter(s => s.type === 'script').map((submission) => (
                      <tr key={submission.id} className="hover:bg-dark-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSubmissionIcon(submission.type)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{submission.title}</div>
                              <div className="text-sm text-gray-400">{submission.description.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.content.contributor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(submission.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => setSelectedSubmission(submission)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {submission.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(submission.id)}
                                className="text-green-500 hover:text-green-400"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleReject(submission.id)}
                                className="text-red-500 hover:text-red-400"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button className="text-yellow-500 hover:text-yellow-400">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Tools Management</h2>
              <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                Add New Tool
              </button>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tool</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredSubmissions.filter(s => s.type === 'tool').map((submission) => (
                      <tr key={submission.id} className="hover:bg-dark-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSubmissionIcon(submission.type)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{submission.title}</div>
                              <div className="text-sm text-gray-400">{submission.description.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.content.contributor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(submission.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => setSelectedSubmission(submission)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {submission.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(submission.id)}
                                className="text-green-500 hover:text-green-400"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleReject(submission.id)}
                                className="text-red-500 hover:text-red-400"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button className="text-yellow-500 hover:text-yellow-400">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* E-Books Tab */}
        {activeTab === 'ebooks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">E-Books Management</h2>
              <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors">
                Add New E-Book
              </button>
            </div>
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">E-Book</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Submitted By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredSubmissions.filter(s => s.type === 'ebook').map((submission) => (
                      <tr key={submission.id} className="hover:bg-dark-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getSubmissionIcon(submission.type)}
                            <div className="ml-3">
                              <div className="text-sm font-medium text-white">{submission.title}</div>
                              <div className="text-sm text-gray-400">{submission.description.substring(0, 50)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {submission.content.suggestedBy || submission.content.contributor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(submission.submittedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => setSelectedSubmission(submission)}
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {submission.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleApprove(submission.id)}
                                className="text-green-500 hover:text-green-400"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={() => handleReject(submission.id)}
                                className="text-red-500 hover:text-red-400"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          <button className="text-yellow-500 hover:text-yellow-400">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-500 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Reported Issues</h2>
              <div className="text-gray-400 text-sm">
                Total Reports: {users.reduce((total, user) => total + user.contributions.reports.length, 0)}
              </div>
            </div>
            
            {/* Debug Information */}
            <div className="bg-dark-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Debug Information:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                {users.map(user => (
                  <div key={user.id}>
                    {user.username}: {user.contributions.reports.length} reports
                    {user.contributions.reports.length > 0 && (
                      <ul className="ml-4 text-xs text-gray-400">
                        {user.contributions.reports.map((report, index) => (
                          <li key={index}>
                            {report.itemType} - {report.itemId} - {report.reason || 'No reason'}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Reported By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Content Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Report Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map(user => 
                      user.contributions.reports.map((report, index) => (
                        <tr key={`${user.id}-${report.itemId}-${index}`} className="hover:bg-dark-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              report.itemType === 'script' ? 'bg-blue-600 text-blue-100' :
                              report.itemType === 'tool' ? 'bg-purple-600 text-purple-100' :
                              report.itemType === 'ebook' ? 'bg-green-600 text-green-100' :
                              'bg-gray-600 text-gray-100'
                            }`}>
                              {report.itemType.charAt(0).toUpperCase() + report.itemType.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {report.itemId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">
                            <div className="max-w-xs">
                              <p className="font-medium text-white mb-1">{report.reason || 'No reason provided'}</p>
                              <p className="text-gray-400 text-xs line-clamp-2">
                                {report.description || 'No description provided'}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => handleViewReport(user, report, index)}
                              className="text-blue-500 hover:text-blue-400" 
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleResolveReport(user, report, index)}
                              className="text-green-500 hover:text-green-400" 
                              title="Resolve Report"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDismissReport(user, report, index)}
                              className="text-red-500 hover:text-red-400" 
                              title="Dismiss Report"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    {users.every(user => user.contributions.reports.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          No reports found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ratings Tab */}
        {activeTab === 'ratings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">Ratings & Feedback</h2>
              <div className="text-gray-400 text-sm">
                Total Ratings: {users.reduce((total, user) => total + user.contributions.ratings.length, 0)}
              </div>
            </div>
            
            {/* Debug Information */}
            <div className="bg-dark-700 p-4 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Debug Information:</h3>
              <div className="text-sm text-gray-300 space-y-1">
                {users.map(user => (
                  <div key={user.id}>
                    {user.username}: {user.contributions.ratings.length} ratings
                    {user.contributions.ratings.length > 0 && (
                      <ul className="ml-4 text-xs text-gray-400">
                        {user.contributions.ratings.map((rating, index) => (
                          <li key={index}>
                            {rating.itemType} - {rating.itemId} - {rating.rating}/5
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-dark-800/50 border border-red-500/20 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dark-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Content Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Item ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map(user => 
                      user.contributions.ratings.map((rating, index) => (
                        <tr key={`${user.id}-${rating.itemId}-${index}`} className="hover:bg-dark-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">{user.username}</div>
                            <div className="text-sm text-gray-400">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              rating.itemType === 'script' ? 'bg-blue-600 text-blue-100' :
                              rating.itemType === 'tool' ? 'bg-purple-600 text-purple-100' :
                              rating.itemType === 'ebook' ? 'bg-green-600 text-green-100' :
                              'bg-gray-600 text-gray-100'
                            }`}>
                              {rating.itemType.charAt(0).toUpperCase() + rating.itemType.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {rating.itemId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star 
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= rating.rating 
                                      ? 'text-yellow-500 fill-current' 
                                      : 'text-gray-400'
                                  }`} 
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-300">
                                {rating.rating}/5
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => handleViewRating(user, rating, index)}
                              className="text-blue-500 hover:text-blue-400" 
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteRating(user, rating, index)}
                              className="text-red-500 hover:text-red-400" 
                              title="Delete Rating"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                    {users.every(user => user.contributions.ratings.length === 0) && (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                          No ratings found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white">User Activity Dashboard</h2>
              <div className="flex space-x-4">
                <button 
                  onClick={exportActivity}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2 inline" />
                  Export Activity
                </button>
              </div>
            </div>

            {/* Activity Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 animate-scale-in">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">Active Contributors</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.userActivity.filter(u => u.submissions > 0).length}
                    </p>
                    <p className="text-xs text-gray-500">
                      Users with submissions
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 animate-scale-in">
                <div className="flex items-center">
                  <Star className="h-8 w-8 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Ratings</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.userActivity.reduce((sum, u) => sum + u.ratings, 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Across all users
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 animate-scale-in">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">Top Contributor</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.userActivity.length > 0 ? stats.userActivity[0].username : 'N/A'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats.userActivity.length > 0 ? `${stats.userActivity[0].submissions} submissions` : 'No data'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6 animate-scale-in">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-500 mr-3" />
                  <div>
                    <p className="text-gray-400 text-sm">Avg. Activity</p>
                    <p className="text-2xl font-bold text-white">
                      {stats.userActivity.length > 0 
                        ? Math.round(stats.userActivity.reduce((sum, u) => sum + u.submissions, 0) / stats.userActivity.length)
                        : 0
                      }
                    </p>
                    <p className="text-xs text-gray-500">
                      Submissions per user
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activity Chart */}
              <div className="animate-fade-in-up">
                <UserActivityChart data={stats.userActivity} />
              </div>

              {/* Activity Trend Chart */}
              <div className="animate-fade-in-up">
                <div className="bg-dark-800/50 border border-red-500/20 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Activity Trends</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Submissions Trend</span>
                      <span className="text-white font-semibold">
                        {stats.submissionTrends.length > 0 
                          ? stats.submissionTrends[stats.submissionTrends.length - 1].total 
                          : 0
                        } this week
                      </span>
                    </div>
                    <div className="w-full bg-dark-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${stats.submissionTrends.length > 0 
                            ? Math.min((stats.submissionTrends[stats.submissionTrends.length - 1].total / 10) * 100, 100)
                            : 0
                          }%` 
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-green-500 font-semibold">
                          {stats.submissionTrends.reduce((sum, d) => sum + d.scripts, 0)}
                        </div>
                        <div className="text-gray-400 text-sm">Scripts</div>
                      </div>
                      <div>
                        <div className="text-blue-500 font-semibold">
                          {stats.submissionTrends.reduce((sum, d) => sum + d.tools, 0)}
                        </div>
                        <div className="text-gray-400 text-sm">Tools</div>
                      </div>
                      <div>
                        <div className="text-yellow-500 font-semibold">
                          {stats.submissionTrends.reduce((sum, d) => sum + d.ebooks, 0)}
                        </div>
                        <div className="text-gray-400 text-sm">E-Books</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Table */}
            <div className="animate-fade-in-up">
              <div className="bg-dark-800/50 border border-red-500/20 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contributions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Last Active</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {stats.userActivity.slice(0, 10).map((user, index) => (
                        <tr key={index} className="hover:bg-dark-700/50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                {index + 1}
                              </div>
                              <div className="text-sm font-medium text-white">{user.username}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {user.submissions} submissions
                            </div>
                            <div className="text-sm text-gray-400">
                              {user.ratings} ratings given
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-32 bg-dark-700 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(user.submissions / Math.max(...stats.userActivity.map(u => u.submissions))) * 100}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {user.contributions > 0 ? `${user.contributions} contributions` : 'No contributions'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-red-500/20 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Review Submission: {selectedSubmission.title}
              </h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Details</h4>
                <div className="bg-dark-700 p-3 rounded text-sm">
                  <p><span className="text-gray-400">Type:</span> {selectedSubmission.type}</p>
                  <p><span className="text-gray-400">Submitted by:</span> {selectedSubmission.content.contributor || selectedSubmission.content.suggestedBy}</p>
                  <p><span className="text-gray-400">Date:</span> {formatDate(selectedSubmission.submittedAt)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Description</h4>
                <p className="text-gray-300">{selectedSubmission.description}</p>
              </div>

              {selectedSubmission.type === 'script' && (
                <div>
                  <h4 className="text-white font-semibold mb-2">Code</h4>
                  <pre className="bg-dark-700 p-3 rounded text-sm overflow-x-auto">
                    <code className="text-gray-300">{selectedSubmission.content.code}</code>
                  </pre>
                </div>
              )}

              <div>
                <h4 className="text-white font-semibold mb-2">Review Notes (Optional)</h4>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full bg-dark-700 border border-gray-600 rounded p-3 text-white"
                  rows={3}
                  placeholder="Add review notes..."
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => handleApprove(selectedSubmission.id)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReject(selectedSubmission.id)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-red-500/20 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                {isEditMode ? 'Edit User' : 'User Details'}: {selectedUser.username}
              </h3>
              <button
                onClick={handleCloseUserModal}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {isEditMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={editUserData.username || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, username: e.target.value })}
                    className="w-full bg-dark-700 border border-gray-600 rounded p-3 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editUserData.email || ''}
                    onChange={(e) => setEditUserData({ ...editUserData, email: e.target.value })}
                    className="w-full bg-dark-700 border border-gray-600 rounded p-3 text-white"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editUserData.isAdmin || false}
                      onChange={(e) => setEditUserData({ ...editUserData, isAdmin: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Admin User</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editUserData.isBanned || false}
                      onChange={(e) => setEditUserData({ ...editUserData, isBanned: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-300">Banned User</span>
                  </label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleSaveUser}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleCloseUserModal}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-white font-semibold mb-2">Basic Information</h4>
                    <div className="bg-dark-700 p-3 rounded text-sm space-y-2">
                      <p><span className="text-gray-400">Username:</span> {selectedUser.username}</p>
                      <p><span className="text-gray-400">Email:</span> {selectedUser.email}</p>
                      <p><span className="text-gray-400">Role:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          selectedUser.isAdmin ? 'bg-red-600 text-red-100' : 'bg-gray-600 text-gray-100'
                        }`}>
                          {selectedUser.isAdmin ? 'Admin' : 'User'}
                        </span>
                      </p>
                      <p><span className="text-gray-400">Status:</span> 
                        <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          selectedUser.isBanned ? 'bg-red-600 text-red-100' : 'bg-green-600 text-green-100'
                        }`}>
                          {selectedUser.isBanned ? 'Banned' : 'Active'}
                        </span>
                      </p>
                      <p><span className="text-gray-400">Joined:</span> {formatDate(selectedUser.createdAt)}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Statistics</h4>
                    <div className="bg-dark-700 p-3 rounded text-sm space-y-2">
                      <p><span className="text-gray-400">Scripts Submitted:</span> {selectedUser.stats.scriptsSubmitted}</p>
                      <p><span className="text-gray-400">Likes Given:</span> {selectedUser.stats.likesGiven}</p>
                      <p><span className="text-gray-400">Shares Made:</span> {selectedUser.stats.sharesMade}</p>
                      <p><span className="text-gray-400">Total Contributions:</span> {selectedUser.stats.contributions}</p>
                      <p><span className="text-gray-400">Reports Submitted:</span> {selectedUser.stats.reportsSubmitted}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={() => handleEditUser(selectedUser)}
                    className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition-colors"
                  >
                    Edit User
                  </button>
                  <button
                    onClick={handleCloseUserModal}
                    className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-red-500/20 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Report Details</h3>
              <button
                onClick={handleCloseReportModal}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">Reporter Information</h4>
                  <div className="bg-dark-700 p-3 rounded text-sm space-y-2">
                    <p><span className="text-gray-400">Username:</span> {selectedReport.user.username}</p>
                    <p><span className="text-gray-400">Email:</span> {selectedReport.user.email}</p>
                    <p><span className="text-gray-400">Report Date:</span> {formatDate(selectedReport.user.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Reported Content</h4>
                  <div className="bg-dark-700 p-3 rounded text-sm space-y-2">
                    <p><span className="text-gray-400">Content Type:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedReport.report.itemType === 'script' ? 'bg-blue-600 text-blue-100' :
                        selectedReport.report.itemType === 'tool' ? 'bg-purple-600 text-purple-100' :
                        selectedReport.report.itemType === 'ebook' ? 'bg-green-600 text-green-100' :
                        'bg-gray-600 text-gray-100'
                      }`}>
                        {selectedReport.report.itemType.charAt(0).toUpperCase() + selectedReport.report.itemType.slice(1)}
                      </span>
                    </p>
                    <p><span className="text-gray-400">Item ID:</span> {selectedReport.report.itemId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Report Reason</h4>
                <div className="bg-dark-700 p-3 rounded">
                  <p className="text-white font-medium">{selectedReport.report.reason || 'No reason provided'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Report Description</h4>
                <div className="bg-dark-700 p-3 rounded">
                  <p className="text-gray-300">{selectedReport.report.description || 'No description provided'}</p>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => {
                    handleResolveReport(selectedReport.user, selectedReport.report, selectedReport.index)
                    handleCloseReportModal()
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Resolve Report</span>
                </button>
                <button
                  onClick={() => {
                    handleDismissReport(selectedReport.user, selectedReport.report, selectedReport.index)
                    handleCloseReportModal()
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Dismiss Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rating Details Modal */}
      {showRatingModal && selectedRating && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-red-500/20 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Rating Details</h3>
              <button
                onClick={handleCloseRatingModal}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-white font-semibold mb-2">User Information</h4>
                  <div className="bg-dark-700 p-3 rounded text-sm space-y-2">
                    <p><span className="text-gray-400">Username:</span> {selectedRating.user.username}</p>
                    <p><span className="text-gray-400">Email:</span> {selectedRating.user.email}</p>
                    <p><span className="text-gray-400">Rating Date:</span> {formatDate(selectedRating.user.createdAt)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-white font-semibold mb-2">Rated Content</h4>
                  <div className="bg-dark-700 p-3 rounded text-sm space-y-2">
                    <p><span className="text-gray-400">Content Type:</span> 
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        selectedRating.rating.itemType === 'script' ? 'bg-blue-600 text-blue-100' :
                        selectedRating.rating.itemType === 'tool' ? 'bg-purple-600 text-purple-100' :
                        selectedRating.rating.itemType === 'ebook' ? 'bg-green-600 text-green-100' :
                        'bg-gray-600 text-gray-100'
                      }`}>
                        {selectedRating.rating.itemType.charAt(0).toUpperCase() + selectedRating.rating.itemType.slice(1)}
                      </span>
                    </p>
                    <p><span className="text-gray-400">Item ID:</span> {selectedRating.rating.itemId}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Rating</h4>
                <div className="bg-dark-700 p-3 rounded">
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`h-6 w-6 ${
                          star <= selectedRating.rating.rating 
                            ? 'text-yellow-500 fill-current' 
                            : 'text-gray-400'
                        }`} 
                      />
                    ))}
                    <span className="ml-2 text-lg text-white font-semibold">
                      {selectedRating.rating.rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => {
                    handleDeleteRating(selectedRating.user, selectedRating.rating, selectedRating.index)
                    handleCloseRatingModal()
                  }}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Rating</span>
                </button>
                <button
                  onClick={handleCloseRatingModal}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-800 border border-red-500/20 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Confirm Delete</h3>
              <button
                onClick={() => {
                  setShowDeleteConfirmation(false)
                  setDeleteTarget(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-dark-700 p-4 rounded">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-300 text-center">
                  Are you sure you want to delete this {deleteTarget.type}? This action cannot be undone.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirmation(false)
                    setDeleteTarget(null)
                  }}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}